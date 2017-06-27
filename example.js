const Archive = require('./index');

const archive = new Archive('http://reddit.com/', {
  threads: 4, // number of parallel workers scraping
  path: __dirname, // root directory of where the archives should be downloaded to
  requestDelay: 1000, // the delay between when a request has finished and when the next one should be made
});

archive.on('scrape', (data) => {
  console.log(data);
  /*
   { message: 'starting to scrape website',
   url: 'http://reddit.com/' }

   { message: 'scraping link', url: 'http://reddit.com/' }

   { message: 'scraping link',
   url: 'http://reddit.com//r/thewalkingdead/comments/6jtpuo/i_love_when_the_show_does_throwbacks_to_an/' }

   { message: 'scraping link',
   url: 'http://reddit.com//advertising' }
   */
});

archive.on('link', (data) => {
  console.log(data);
  /*
   { message: 'new link found to scrape',
   url: 'http://reddit.com//static/opensearch.xml' }

   { message: 'new link found to scrape',
   url: 'http://reddit.com//' }

   { message: 'new link found to scrape',
   url: 'http://reddit.com//password' }

   { message: 'new link found to scrape',
   url: 'http://reddit.com//gold' }
   */
});

archive.on('debug', (data) => {
  console.log(data);
  /*
   spinning up, starting 4 new scrapers
   created path: C:\Users\rob\archives\reddit.com\
   saving http://reddit.com/ which has a content size of 146694 bytes
   saving http://reddit.com//domain/youtu.be/ which has a content size of 140674 bytes
   saving http://reddit.com//r/blunderyears/comments/6jsxrx/my_7th_grade_basketball_photo_i_guess_they/ which has a content size of 644779 bytes
   saving http://reddit.com//r/deepfriedmemes which has a content size of 147397 bytes
   */
});

archive.on('saved', (data) => {
  console.log(data);
  /*
   { fileName: 'index.archive',
   path: '',
   fullPath: 'C:\\Users\\rob\\archives\\reddit.com\\\\index.archive',
   size: 146500,
   stats: { size: 143.06640625, saved: 1 } }

   { fileName: '.archive',
   path: '/r/blunderyears/comments/6jsxrx/my_7th_grade_basketball_photo_i_guess_they',
   fullPath: 'C:\\Users\\rob\\archives\\reddit.com\\/r/blunderyears/comments/6jsxrx/my_7th_grade_basketball_photo_i_guess_they\\.archive',
   size: 648460,
   stats: { size: 776.328125, saved: 2 } }

   { fileName: 'deepfriedmemes.archive',
   path: '/r',
   fullPath: 'C:\\Users\\rob\\archives\\reddit.com\\/r\\deepfriedmemes.archive',
   size: 147395,
   stats: { size: 920.2685546875, saved: 3 } }
   */
});

archive.on('error', console.log);
archive.start();