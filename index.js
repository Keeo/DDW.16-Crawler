const Crawler = require('./crawler');
const website = 'http://localhost:8000';
const fs = require('fs');

const crawler = new Crawler(website);
const people = [];

crawler.run(parsed => {
  const title = parsed('h1').text();
  const name = parsed('.name').text();
  const phone = parsed('.phone').text();
  const age = parsed('.age').text();

  if (name) {
    people.push({title, name, phone, age});
  }
}).then(() => {
  fs.writeFile('people.json', JSON.stringify(people));
  fs.writeFile('sitemap.xml', crawler.getSitemap());

  console.log(people);
  const sitemap = crawler.getSitemap();
  console.log(sitemap);
});


