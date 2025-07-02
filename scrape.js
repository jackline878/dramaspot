const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeTMZ(query) {
  const searchUrl = `https://www.tmz.com/search/${encodeURIComponent(query)}`;
  const response = await axios.get(searchUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const $ = cheerio.load(response.data);
  const articles = [];

  $('article').each((_, el) => {
    const title = $(el).find('h3 a').text().trim();
    const link = 'https://www.tmz.com' + $(el).find('h3 a').attr('href');
    const img = $(el).find('img').attr('src');

    if (title && link) {
      articles.push({ title, link, image: img });
    }
  });

  // Save to JSON file
  const fileName = `tmz-results-${query.replace(/\s+/g, '_')}.json`;
  fs.writeFileSync(fileName, JSON.stringify(articles, null, 2), 'utf8');

  console.log(`Saved ${articles.length} articles to ${fileName}`);
}

// Run it with a sample query
scrapeTMZ('kanye west');
