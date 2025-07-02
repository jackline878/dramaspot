const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'public', 'sitemap.xml');
const { Article, Category, Hashtag, Subcategory } = require('../models');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://www.dramaspots.com';

    // Limit the number of entries to avoid sitemap overflow
    const [articles, categories, hashtags] = await Promise.all([
      Article.findAll({
        limit: 1000, // adjust based on size
        attributes: ['slug', 'image', 'updatedAt']
      }),
      Category.findAll({
        attributes: ['name', 'updatedAt'],
              include: [{
        model: Subcategory,
        as: 'subcategories',
        required: true,
        include: [{
          model: Article,
          as: 'articles',
          required: true,
          attributes: [] // we only care about existence
        }]
      }],
      }),
      Hashtag.findAll({
        limit: 100,
        attributes: ['name', 'updatedAt'],
          include: [{
          model: Article,
          as: 'articles',
          required: true,
          attributes: [] // we only care about existence
        }]
      })
    ]);

    const staticPages = `
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

    const articleUrls = articles.map(article => `
  <url>
    <loc>${baseUrl}/article/${encodeURIComponent(article.slug)}</loc>
    <lastmod>${new Date(article.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${article.image ? `
    <image:image>
      <image:loc>${article.image}</image:loc>
      <image:caption>${article.slug.replace(/-/g, ' ')}</image:caption>
    </image:image>` : ''}
  </url>`).join('');

    const categoryUrls = categories.map(cat => `
  <url>
    <loc>${baseUrl}/category/${encodeURIComponent(cat.name)}</loc>
    <lastmod>${new Date(cat.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

    const hashtagUrls = hashtags.map(tag => `
  <url>
    <loc>${baseUrl}/hashtag/${encodeURIComponent(tag.name)}</loc>
    <lastmod>${new Date(tag.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPages}
${articleUrls}
${categoryUrls}
${hashtagUrls}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Serve robots.txt
router.get('/robots.txt', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'robots.txt');
  res.sendFile(filePath);
});
router.get('/ads.txt', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'ads.txt');
  res.sendFile(filePath);
});

router.get('/8eb0e434093a8ded9ae0abdfa036baca.txt', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', '8eb0e434093a8ded9ae0abdfa036baca.txt');
  res.sendFile(filePath);
});

module.exports = router;
