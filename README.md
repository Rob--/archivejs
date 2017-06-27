## archivejs

A Node module to archive websites. The module attempts to scan websites
and download as many pages as it can find.

```javascript
const Archive = require('archivejs');
const site = new Archive('http://example.com', {
  threads: 2
});

site.start();
```

## Installation
```javascript
$ npm install archivejs
```

## Usage

Instantiate the archive class as per the example above (`new Archive(url, options)`).

To start archiving:
`site.start();`

To stop archiving: `site.stop();`

To attach event listeners: `site.on(eventName, callback);`

For a full example, refer to `example.js`.

You can pass options when creating an archive by passing an object
after the URL:
- `threads` - the number of workers to scrape the site in parallel,
defaults to `1`
- `path` - the root path of the directory to save the archives, defaults
to `__dirname`
- `requestDelay` - the time in milliseconds to wait before making another
request after scraping a page, defaults to `50`

## Features
- downloads pages to a given folder
- scrapes pages for resources such as .css or .js files
- downloads images and svg files from pages (from image elements)
- find links between pages to repeat the download/scrape process

TODO:
- video downloads
- proxy support to prevent rate limiting

## Events

Event listeners can be attached to the archive to monitor progress and
get statistics.

---

### scrape

- `url` the url being requested/scraped

Emitted just before a page is scraped.

---

### link

- `url` - new url that was found when scraping, and will be added to
the queue to be scraped

Emitted when parsing a page and a link is found.

---

### saved

- `data` - object containing data about the page saved
  - `fileName` - name of the file saved
  - `path` - path relative to the archive project root
  - `fullPath` - full path of the file on disk
  - `size` - size of the file in bytes
  - `stats` - object providing stats about the entire archive progress
    - `size` - total size in bytes downloaded and saved to disk
    - `saved` - number of pages saved so far

Emitted every time a page is downloaded and saved to disk.

---

### error

- `message` - message providing context
- `error` - the errow that was thrown

Emitted every time an error occurs. An event listener needs to be
set up for this event to prevent errors from being thrown.

---

### debug

- `message` - debug info