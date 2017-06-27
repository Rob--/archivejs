const request = require('request');
const cheerio = require('cheerio');
const Events = require('events');
const fs = require('fs');
const urls = require('url');
const mkdirp = require('mkdirp');

class Archive {

  constructor (url, options = {}) {
    this.threads = options.threads || 1;
    this.path = `${options.path || __dirname}\\archives\\${urls.parse(url).hostname}\\`;
    this.requestDelay = options.requestDelay || 50;

    if (!urls.parse(url).hostname) {
      throw new Error(`Invalid hostname for the url: ${url}`);
    }

    this.emitter = new Events();
    this.url = url;
    this.urlObject = urls.parse(url);
    this.links = [];
    this.continue = true;
    this.stats = {
      size: 0, scraped: [],
    }

    this.initialise();
  }

  initialise() {
    this.emitter.emit('debug', 'initialising: creating project path');
    mkdirp(this.path, (err) => {
      if (err) {
        this.emitter.emit('error', {
          message: `error creating file: ${this.path}`,
          error: err,
        });
      } else {
        this.emitter.emit('debug', `created path: ${this.path}`);
      }
    })
  }

  getStats() {
    return this.stats;
  }

  on (name, callback) {
    this.emitter.on(name, callback);
  }

  stop () {
    this.emitter.emit('debug', 'stopping');
    // the scrape function checks whether or not to continue based on this value
    this.continue = false;
  }

  start () {
    this.emitter.emit('scrape', {
      message: 'starting to scrape website',
      url: this.url,
    })

    // pushes the base url to the scraping queue
    this.links.push(this.url);

    this.emitter.emit('debug', `spinning up, starting ${this.threads} new scrapers`);
    for (let i = 0; i < this.threads; i += 1) {
      this.scrape();
    }
  }

  savePage (url, body) {
    this.emitter.emit('debug', `saving ${url} which has a content size of ${body.length} bytes`);

    // this logic needs to be improved
    let fullPath = (url.split(this.url)[1] || 'index') + '.archive';

    // split the url into the path and file name so we can create the path if necessary
    const path = fullPath.substr(0, fullPath.lastIndexOf('/'));
    const fileName = fullPath.substr(fullPath.lastIndexOf('/') + 1, fullPath.length);

    mkdirp(this.path + path, (err) => {
      if (err) {
        this.emitter.emit('error', {
          message: `error creating path: ${this.path + path}`,
          error: err
        });
        return;
      }

      fs.writeFile(this.path + path + '\\' + fileName, body, (err) => {
        if (err) {
          this.emitter.emit('error', {
            message: `error saving file: ${this.path + path + '\\' + fileName}`,
            error: err,
          });
        } else {
          this.stats.size += body.length / 1024;
          this.emitter.emit('saved', {
            fileName: fileName,
            path: path,
            fullPath: this.path + path + '\\' + fileName,
            size: body.length,
            stats: {
              size: this.stats.size,
              saved: this.stats.scraped.length,
            }
          });
        }
      });
    });
  }

  extractLink (link) {
    // filter out any id references or javascript
    if (!link || link[0] === '#' || link.startsWith('javascript:')) return;

    // exclude queries from the url
    if (link.includes('?')) {
      link = link.split('?')[0];
    }

    if (link.includes('#')) {
      link = link.split('#')[0];
    }

    // if we get a link that begins with a slash, add the base url
    // ensure it is not '//' as that is valid URL for another domain with no protocol specified
    if (link.length > 0 && link[0] === '/' && link[1] !== '/') {
      link = this.url + link;
    }

    // we only want pages on the same domain as the one being archived
    if (urls.parse(link).hostname !== this.urlObject.hostname) {
      return;
    }

    return link;
  }

  processLink (link) {
    if (!this.links.includes(link) && !this.stats.scraped.includes(link)) {
      this.links.push(link);
      this.emitter.emit('link', {
        message: `new link found to scrape`,
        url: link,
      });
    }
  }

  scrape () {
    if (!this.continue) return;

    // another request may be in process that will return links, so keep checking
    if (this.links.length === 0) {
      setTimeout(this.scrape, 200);
      return;
    };

    const url = this.links.pop();
    this.emitter.emit('scrape', {
      message: 'scraping link',
      url,
    });

    this.stats.scraped.push(url);

    request(url, (err, res, body) => {
      if (err) {
        this.emitter.emit('error', {
          message: 'error making http request',
          error: err,
        });
        this.scrape();
        return;
      }

      this.savePage(url, body);

      const $ = cheerio.load(body);

      const linkFilter = (index, element) => {
        // get the url from the attribs depending on the element
        let link = element.name === 'script' ? element.attribs.src : element.attribs.href;

        // extract the url we want to request (filtering out id references, queries, etc)
        if (link) link = this.extractLink(link);

        // adds the link to the queue if needed
        if (link) this.processLink(link);
      }

      $('link, a, script').each(linkFilter);

      // finished scraping, get the next scrape
      // setTimeout(this.scrape, this.requestDelay);
      setTimeout(() => {
        this.scrape();
      }, this.requestDelay);
    });
  }

}

module.exports = Archive;