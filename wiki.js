const Crawler = require('./crawler');
const website = 'https://en.wikipedia.org';

const crawler = new Crawler(website);
const pages = [];

crawler.run(parsed => {
  const title = parsed('h1').text();
  const images = [];
  parsed('img').each((i, elem) => {
    images.push(elem.attribs.src);
  });
  pages.push({title, images});

  if (pages.length > 10) {
    console.log(pages);
    process.exit();
  }

}).then(() => {
  console.log(pages);
});


