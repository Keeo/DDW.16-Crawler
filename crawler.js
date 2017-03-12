const cheerio = require('cheerio');
const fetch = require('node-fetch');

module.exports = class Crawler {
  constructor(website) {
    this.website = website;
    this.crawled = [];
    this.buffer = [];
    this.filters = [];
    this.depth = Infinity;

    this.buffer.push({website, depth: 0});
  }

  setDepth(depth) {
    this.depth = depth;
  }

  addFilter(filter) {
    this.filters.push(filter);
  }

  async run(extract) {
    while (this.buffer.length > 0) {
      const {website, depth} = this.buffer.shift();
      this.crawled.push({website, depth});

      console.log(`Processing [${depth}] ${website}.`);
      const parsedHtml = await this.process(website, depth);
      extract(parsedHtml);

      await this.wait(400);
    }
  }

  async process(url, depth) {
    const website = await fetch(url, {headers: {'user-agent': "DDW"}});
    const text = await website.text();
    const parsed = cheerio.load(text);
    parsed('a').each((i, elem) => {
      if (!elem.attribs.href) {
        return;
      }

      const href = elem.attribs.href.replace("&setver=touch", "").replace("?setver=touch", "").replace("/?cache=no", "");

      // rel link
      if (href.charAt(0) === '/' && href.charAt(1) !== '/') {
        const url = this.website + href;
        if (this.filters.length === 0 || !this.filters.some(filter => filter(url, href))) {
          this._pushNewUrl(url, depth + 1);
        }
      }

      //abs link
      if (href.indexOf(this.website) === 0) {
        if (this.filters.length === 0 || !this.filters.some(filter => filter(href, href.replace(this.website, '')))) {
          this._pushNewUrl(href, depth + 1);
        }
      }
    });
    return parsed;
  }

  _pushNewUrl(href, depth) {
    const crawledPage = this.crawled.find(({website: vHref, depth: vDepth}) => sameUrl(vHref, href));
    if (crawledPage && crawledPage.depth <= depth) {
      //console.log("[D] already processed better depth", href);
      return;
    }

    const bufferPage = this.buffer.find(({website: vHref, depth: vDepth}) => sameUrl(vHref, href));
    if (bufferPage && bufferPage.depth > depth) {
      bufferPage.depth = Math.min(depth, bufferPage.depth);
      //console.log("[I] adding better depth", href);
      return;
    }

    if (!bufferPage && depth <= this.depth) {
      //console.log(`[N] [${depth}] new website: `, href);
      this.buffer.push({website: href, depth});
    }
  }

  async wait(time) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    });
  }
};

function sameUrl(a, b) {
  return a === b || a.substr(0, a.length - 1) === b || b.substr(0, b.length -1) === a;
}