const cheerio = require('cheerio');
const fetch = require('node-fetch');

module.exports = class Crawler {
  constructor(website) {
    this.website = website;
    this.crawled = [];
    this.buffer = [];

    this.buffer.push(website);
  }

  async run(extract) {
    while (this.buffer.length > 0) {
      const website = this.buffer.pop();
      if (this.crawled.includes(website)) {
        continue;
      }

      console.log(`Processing ${website}.`);
      const parsedHtml = await this.process(website);
      extract(parsedHtml);

      this.crawled.push(website);
      //await this.wait(1100);
    }
  }

  getSitemap() {
    const core = this.crawled.map(url => {
      return `<url>
        <loc>${url}</loc>
        <changefreq>hourly</changefreq>
        <priority>1.0</priority>
    </url>`
    }).join('\n');

    return `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    ${core}
    </urlset>`
  }

  async process(url) {
    const website = await fetch(url, {headers: {'user-agent': "DDW"}});
    const text = await website.text();
    const parsed = cheerio.load(text);
    parsed('a').each((i, elem) => {
      const href = elem.attribs.href;
      if (href && href.charAt(0) === '/' && href.charAt(1) !== '/') {
        this.buffer.push(this.website + href);
      }
    });
    return parsed;
  }

  async wait(time) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }
};
