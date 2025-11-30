const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const filePath = path.join(__dirname, '..', 'public', 'sitemap.xml');
const { Article, Category, Hashtag, Subcategory } = require('../models');
function escapeXml(unsafe) {
  return unsafe
    ?.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
const genres = [
  { name: "African", slug: "african" },
  { name: "Arabic", slug: "arabic" },
  { name: "Blues", slug: "blues" },
  { name: "Bollywood & Indian", slug: "bollywood-indian" },
  { name: "Classical", slug: "classical" },
  { name: "Country & Americana", slug: "country-americana" },
  { name: "Dance & Electronic", slug: "dance-electronic" },
  { name: "Decades", slug: "decades" },
  { name: "Family", slug: "family" },
  { name: "Folk & Acoustic", slug: "folk-acoustic" },
  { name: "German hip-hop", slug: "german-hip-hop" },
  { name: "German pop", slug: "german-pop" },
  { name: "Hip-Hop", slug: "hip-hop" },
  { name: "Indie & Alternative", slug: "indie-alternative" },
  { name: "J-Pop", slug: "j-pop" },
  { name: "Jazz", slug: "jazz" },
  { name: "K-Pop", slug: "k-pop" },
  { name: "Latin", slug: "latin" },
  { name: "Mandopop & Cantopop", slug: "mandopop-cantopop" },
  { name: "Metal", slug: "metal" },
  { name: "Pop", slug: "pop" },
  { name: "R & B & Soul", slug: "rb-soul" },
  { name: "Reggae & Caribbean", slug: "reggae-caribbean" },
  { name: "Rock", slug: "rock" },
  { name: "Schlager", slug: "schlager" },
  { name: "Soundtracks & Musicals", slug: "soundtracks-musicals" }
];

const moods = [
  { name: "Chill", slug: "chill" },
  { name: "Commute", slug: "commute" },
  { name: "Energize", slug: "energize" },
  { name: "Feel good", slug: "feel-good" },
  { name: "Focus", slug: "focus" },
  { name: "Party", slug: "party" },
  { name: "Romance", slug: "romance" },
  { name: "Sad", slug: "sad" },
  { name: "Sleep", slug: "sleep" },
  { name: "Summer", slug: "summer" },
  { name: "Workout", slug: "workout" }
];

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://www.dramaspots.com';

    // Limit the number of entries to avoid sitemap overflow
    const [articles, categories, hashtags] = await Promise.all([
      Article.findAll({
        limit: 1000, // adjust based on size
        attributes: ['slug', 'image', 'updatedAt'],
        order: [['updatedAt', 'DESC']]  // ⬅️ newest updated articles first
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


// router.get('/sitemap2.xml', (req, res) => {
//   res.header('Content-Type', 'application/xml');

//   const staticUrls = [
//     { loc: `${baseUrl}/music`, priority: '0.9', changefreq: 'daily' },
//   ];

//   const genreUrls = genres.map(genre => ({
//     loc: `${baseUrl}/music/genre/${genre.slug}`,
//     priority: '0.8',
//     changefreq: 'daily',
//     lastmod: new Date().toISOString().split('T')[0],
//   }));

//   const moodUrls = moods.map(mood => ({
//     loc: `${baseUrl}/music/mood/${mood.slug}`,
//     priority: '0.8',
//     changefreq: 'daily',
//     lastmod: new Date().toISOString().split('T')[0],
//   }));


//   const allUrls = [...staticUrls, ...genreUrls, ...moodUrls];

//   const xml = `<?xml version="1.0" encoding="UTF-8"?>
//   <urlset 
//   xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
//   xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
//   xmlns:xhtml="http://www.w3.org/1999/xhtml">
//   ${allUrls.map(url => `
//   <url>
//     <loc>${url.loc}</loc>
//     <lastmod>${url.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
//     <changefreq>${url.changefreq}</changefreq>
//     <priority>${url.priority}</priority>
//   </url>`).join('')}
//  </urlset>`;

//   res.send(xml);
// });

// // routes/sitemap3.js
// router.get('/sitemap3.xml', async (req, res) => {
//   res.header('Content-Type', 'application/xml');
//   const baseUrl = 'https://dramaspots.com';

//   const staticUrls = [
//     `<url><loc>${baseUrl}/music</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`
//   ];

//   const fetchPlaylists = async (url, slugType) => {
//     try {
//       const { data: html } = await axios.get(url, {
//         headers: { 'User-Agent': 'Mozilla/5.0' }
//       });

//       const $ = cheerio.load(html);
//       const playlists = [];

//       $('.playlist .card.mb-4').each((_, el) => {
//         const card = $(el);
//         const a = card.closest('a');
//         const img = card.find('img[data-src]');
//         const url = a.attr('href');
//         const link = url.startsWith('https://tubidy.ac/')
//           ? url.replace('https://tubidy.ac/', 'all/')
//           : url;

//         playlists.push({
//           title: escapeXml(card.find('h3').text().trim()),
//           link: escapeXml(link),
//           img: escapeXml(img.attr('data-src')),
//         });

//       });

//       return playlists.map(pl => `
//         <url>
//   <loc>${escapeXml(`${baseUrl}/music/${pl.link}`)}</loc>
//   <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
//   <changefreq>daily</changefreq>
//   <priority>0.8</priority>
//   ${pl.img ? `
//   <image:image>
//     <image:loc>${escapeXml(pl.img)}</image:loc>
//     <image:caption>${escapeXml(pl.title)}</image:caption>
//   </image:image>` : ''}
// </url>
// `);
//     } catch (error) {
//       console.error(`Failed to fetch ${slugType} playlists from ${url}`, error.message);
//       return [];
//     }
//   };

//   const allGenreUrls = await Promise.all(genres.map(genre => fetchPlaylists(`https://tubidy.ac/genre/${genre.slug}`, 'genre')));

//   const allUrls = [
//     ...staticUrls,
//     ...allGenreUrls.flat(),
//   ];


//   const xml = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset 
//   xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
//   xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
//   xmlns:xhtml="http://www.w3.org/1999/xhtml">
//   ${allUrls.join('\n')}
// </urlset>`;

//   res.send(xml);
// });

// router.get('/sitemap4.xml', async (req, res) => {
//   res.header('Content-Type', 'application/xml');
//   const baseUrl = 'https://dramaspots.com';

//   const staticUrls = [
//     `<url><loc>${baseUrl}/music</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`
//   ];

//   const fetchPlaylists = async (url, slugType) => {
//     try {
//       const { data: html } = await axios.get(url, {
//         headers: { 'User-Agent': 'Mozilla/5.0' }
//       });

//       const $ = cheerio.load(html);
//       const playlists = [];

//       $('.playlist .card.mb-4').each((_, el) => {
//         const card = $(el);
//         const a = card.closest('a');
//         const img = card.find('img[data-src]');
//         const url = a.attr('href');
//         const link = url.startsWith('https://tubidy.ac/')
//           ? url.replace('https://tubidy.ac/', 'all/')
//           : url;

//         playlists.push({
//           title: escapeXml(card.find('h3').text().trim()),
//           link: escapeXml(link),
//           img: escapeXml(img.attr('data-src')),
//         });

//       });

//       return playlists.map(pl => `
//         <url>
//   <loc>${escapeXml(`${baseUrl}/music/${pl.link}`)}</loc>
//   <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
//   <changefreq>daily</changefreq>
//   <priority>0.8</priority>
//   ${pl.img ? `
//   <image:image>
//     <image:loc>${escapeXml(pl.img)}</image:loc>
//     <image:caption>${escapeXml(pl.title)}</image:caption>
//   </image:image>` : ''}
// </url>
// `);
//     } catch (error) {
//       console.error(`Failed to fetch ${slugType} playlists from ${url}`, error.message);
//       return [];
//     }
//   };

//   const allMoodUrls = await Promise.all(moods.map(mood => fetchPlaylists(`https://tubidy.ac/mood/${mood.slug}`, 'mood')));

//   const allUrls = [
//     ...staticUrls,
//     ...allMoodUrls.flat()
//   ];


//   const xml = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset 
//   xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
//   xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
//   xmlns:xhtml="http://www.w3.org/1999/xhtml">
//   ${allUrls.join('\n')}
// </urlset>`;

//   res.send(xml);
// });



const baseUrl = 'https://dramaspots.com';

function escapeXml(unsafe) {
  return unsafe
    ?.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// // Sitemap Index
// router.get('/sitemap6.xml', (req, res) => {
//   res.header('Content-Type', 'application/xml');

//   const xml = `<?xml version="1.0" encoding="UTF-8"?>
// <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   ${moods.map(mood => `
//   <sitemap>
//     <loc>${baseUrl}/sitemap-mood-${mood.slug}.xml</loc>
//     <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
//   </sitemap>`).join('')}
//   ${genres.map(genre => `
//   <sitemap>
//     <loc>${baseUrl}/sitemap-genre-${genre.slug}.xml</loc>
//     <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
//   </sitemap>`).join('')}
// </sitemapindex>`;
//   res.send(xml);
// });

// // Dynamic Playlist Sitemap
// router.get('/sitemap-:type-:slug.xml', async (req, res) => {
//   const { type, slug } = req.params;
//   const pageUrl = `https://tubidy.ac/${type}/${slug}`;

//   res.header('Content-Type', 'application/xml');

//   try {
//     const { data: html } = await axios.get(pageUrl, {
//       headers: { 'User-Agent': 'Mozilla/5.0' },
//     });

//     const $ = cheerio.load(html);
//     const playlists = [];

//     $('.playlist .card.mb-4').each((_, el) => {
//       const card = $(el);
//       const a = card.closest('a');
//       const img = card.find('img[data-src]');
//       const href = a.attr('href') || '';
//       const link = href.startsWith('https://tubidy.ac/')
//         ? href.replace('https://tubidy.ac/', 'all/')
//         : href;

//       playlists.push({
//         title: escapeXml(card.find('h3').text().trim()),
//         link,
//         img: escapeXml(img.attr('data-src')),
//       });
//     });

//     if (playlists.length === 0) {
//       return res.status(404).send(`<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>`);
//     }

//     const xml = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset 
//   xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
//   xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
//   ${playlists.map(pl => `
//   <url>
//     <loc>${baseUrl}/music/${pl.link}</loc>
//     <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
//     <changefreq>daily</changefreq>
//     <priority>0.8</priority>
//     ${pl.img ? `
//     <image:image>
//       <image:loc>${pl.img}</image:loc>
//       <image:caption>${pl.title}</image:caption>
//     </image:image>` : ''}
//   </url>`).join('')}
// </urlset>`;

//     res.send(xml);
//   } catch (err) {
//     console.error('Error generating sitemap:', err.message);
//     res.status(500).send('Internal Server Error');
//   }
// });




// // Dynamic Playlist Sitemap
// router.get('/sitemap3-playlist-:link.xml', async (req, res) => {
//   const { link } = req.params;

//     const url = `https://tubidy.ac/${decodeURIComponent(link).replace('all/', '')}`;
//     console.log(url);

//   res.header('Content-Type', 'application/xml');

//   try {
   
//        const { data: html } = await axios.get(url, {
//          headers: { 'User-Agent': 'Mozilla/5.0' }
//        });
//        const $ = cheerio.load(html);
   
//        // Tracks
//        const tracks = [];
//        $('.playlist .card.mb-4').each((_, el) => {
//          const $el = $(el);
//          const a = $el.find('a').first();
//          const img = a.find('img[data-src]');
//          const url = a.attr('href');
//          const link = url.startsWith('https://tubidy.ac/download/')
//            ? url.replace('https://tubidy.ac/download/', '')
//            : url;
//          tracks.push({
//            title: a.find('h3').text().trim(),
//            link,
//            img: img.attr('data-src'),
//            alt: img.attr('alt'),
//            duration: a.find('time.duration span').text().trim()
//          });
//        });
   

//     if (tracks.length === 0) {
//       return res.status(404).send(`<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>`);
//     }

//     const xml = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset 
//   xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
//   xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
//   ${tracks.map(pl => `
//   <url>
//     <loc>${baseUrl}/music/${pl.link}</loc>
//     <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
//     <changefreq>daily</changefreq>
//     <priority>0.8</priority>
//     ${pl.img ? `
//     <image:image>
//       <image:loc>${pl.img}</image:loc>
//       <image:caption>${pl.title}</image:caption>
//     </image:image>` : ''}
//   </url>`).join('')}
// </urlset>`;

//     res.send(xml);
//   } catch (err) {
//     console.error('Error generating sitemap:', err.message);
//     res.status(500).send('Internal Server Error');
//   }
// });








// // Sitemap Index
// router.get('/sitemap7.xml', (req, res) => {
//   res.header('Content-Type', 'application/xml');

//   const xml = `<?xml version="1.0" encoding="UTF-8"?>
// <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   ${moods.map(mood => `
//   <sitemap>
//     <loc>${baseUrl}/sitemap2-mood-${mood.slug}.xml</loc>
//     <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
//   </sitemap>`).join('')}
//   ${genres.map(genre => `
//   <sitemap>
//     <loc>${baseUrl}/sitemap2-genre-${genre.slug}.xml</loc>
//     <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
//   </sitemap>`).join('')}
// </sitemapindex>`;
//   res.send(xml);
// });

// // Dynamic Playlist Sitemap
// router.get('/sitemap2-:type-:slug.xml', async (req, res) => {
//   const { type, slug } = req.params;
//   const pageUrl = `https://tubidy.ac/${type}/${slug}`;

//   res.header('Content-Type', 'application/xml');

//   try {
//     const { data: html } = await axios.get(pageUrl, {
//       headers: { 'User-Agent': 'Mozilla/5.0' },
//     });

//     const $ = cheerio.load(html);
//     const playlists = [];

//     $('.playlist .card.mb-4').each((_, el) => {
//       const card = $(el);
//       const a = card.closest('a');
//       const img = card.find('img[data-src]');
//       const href = a.attr('href') || '';
//       const link = href.startsWith('https://tubidy.ac/')
//         ? href.replace('https://tubidy.ac/', 'all/')
//         : href;

//       playlists.push({
//         title: escapeXml(card.find('h3').text().trim()),
//         link,
//         img: escapeXml(img.attr('data-src')),
//       });
//     });

//     if (playlists.length === 0) {
//       return res.status(404).send(`<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>`);
//     }

//   const xml = `<?xml version="1.0" encoding="UTF-8"?>
// <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   ${playlists.map(pl => `
//   <sitemap>
//     <loc>${baseUrl}/sitemap3-playlist-${encodeURIComponent(pl.link)}.xml</loc>
//     <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
//   </sitemap>`).join('')}
// </sitemapindex>`;

//     res.send(xml);
//   } catch (err) {
//     console.error('Error generating sitemap:', err.message);
//     res.status(500).send('Internal Server Error');
//   }
// });

// Serve robots.txt
router.get('/robots.txt', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'robots.txt');
  res.sendFile(filePath);
});
router.get('/ads.txt', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'ads.txt');
  res.sendFile(filePath);
});

router.get('/app-ads.txt', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'app-ads.txt');
  res.sendFile(filePath);
});

router.get('/editor', (req, res) => {
  const filePath = path.join(__dirname, '..', 'admin', 'editor.html');
  res.sendFile(filePath);
});

router.get('/editor.css', (req, res) => {
  const filePath = path.join(__dirname, '..', 'admin', 'editor.css');
  res.sendFile(filePath);
});

router.get('/editor.js', (req, res) => {
  const filePath = path.join(__dirname, '..', 'admin', 'editor.js');
  res.sendFile(filePath);
});

router.get('/handle_edit.js', (req, res) => {
  const filePath = path.join(__dirname, '..', 'admin', 'handle_edit.js');
  res.sendFile(filePath);
});

router.get('/8eb0e434093a8ded9ae0abdfa036baca.txt', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', '8eb0e434093a8ded9ae0abdfa036baca.txt');
  res.sendFile(filePath);
});

module.exports = router;
