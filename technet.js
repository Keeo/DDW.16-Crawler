const Crawler = require('./crawler');
const cheerio = require('cheerio');
const fs = require('fs');
const website = 'http://technet.idnes.cz';

const crawler = new Crawler(website);
const pages = [];

crawler.addFilter(function(url, href) {
  return url.includes('diskuse.aspx');
});

crawler.addFilter(function(url, href) {
  return url.includes('foto.aspx');
});

crawler.setDepth(3);

crawler.run(parsed => {
  try {
    const ogTitle = assertOne(parsed, `meta[property='og:title']`).attribs.content;
    const ogDescription = assertOne(parsed, `meta[property='og:description']`).attribs.content;
    const ogUrl = assertOne(parsed, `meta[property='og:url']`).attribs.content;
    const ogPublished = assertOne(parsed, `meta[property='article:published_time']`).attribs.content;
    const body = parsed('div[itemprop="articleBody"]').text();

    const authors = parsed('span[itemprop="author"] a span[itemprop="name"]').map((i, elem) => cheerio(elem).text()).get();
    authors.push(...parsed('span[itemprop="author"] a span[itemprop="additionalName"]').map((i, elem) => cheerio(elem).text()).get());

    const page = {
      title: ogTitle,
      description: ogDescription,
      url: ogUrl,
      created: ogPublished,
      body,
      authors,
    };

    pages.push(page);

    if (pages.length % 50 === 0) {
      console.log(`Websites in buffer: ${crawler.buffer.length}.`);
      console.log(`Websites in already accessed: ${crawler.crawled.length}.`);
      console.log(`Websites suited for processing: ${pages.length}.`);
    }
  } catch (e) {
    if (e!=='unknown-page') {
      console.log(e);
    }
  }
}).then(() =>{
  console.log(`Exiting...`);
  fs.writeFileSync('technet/' + crawler.depth + '-' + Date.now() + '.json', JSON.stringify(pages));
  console.log(`Websites in buffer: ${crawler.buffer.length}.`);
  console.log(`Websites in already accessed: ${crawler.crawled.length}.`);
});

function assertOne(parsed, selector) {
  const selected = parsed(selector);

  if (selected.length !== 1) {
    throw 'unknown-page';
  }

  return selected[0];
}
