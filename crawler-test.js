const Crawler = require('./crawler');
const cheerio = require('cheerio');
const fs = require('fs');
const website = 'http://technet.idnes.cz';

const crawler = new Crawler(website);

crawler.crawled.push({website, depth: 0});
crawler.crawled.push({website: website + '/', depth: 1});
crawler.buffer.pop();

crawler._pushNewUrl("http://technet.idnes.cz/", 0);
//crawler._pushNewUrl("http://technet.idnes.cz", -5);
//crawler._pushNewUrl("http://technet.idnes.cz", 0);
console.log(crawler.buffer);
console.log(crawler.crawled);
