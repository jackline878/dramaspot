// routes/songs.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const { renderMusic } = require('../render/music');
const { renderClassification } = require('../render/classification');
const { renderPlayList } = require('../render/playlist');
const { renderSearch } = require('../render/searchMusic');
const { ne, ur } = require('@faker-js/faker');
const geoip = require('geoip-lite');
const router = express.Router();


// Fake function — replace with real proxy config
function selectProxyByCountry(country) {
  const proxies = {
    KE: { host: 'ke.proxy.server', port: 8080 },
    NG: { host: 'ng.proxy.server', port: 8080 },
    US: { host: 'us.proxy.server', port: 8080 },
  };
  return proxies[country] || null;
}

// Detect user location and get proxy
async function fetchProxy(req) {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const userIp = (forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress) || '';

    const geo = geoip.lookup(userIp);
    const country = geo?.country || 'US';

    const proxy = selectProxyByCountry(country);
    console.log(`User IP: ${userIp}, Country: ${country}, Proxy:`, proxy);

    return proxy;
  } catch (error) {
    console.error('GeoIP error:', error.message);
    return null;
  }
}


async function fetchTubidyVideoData(url) {

  try {
    const response = await axios.get(url);
    return response.data.result.formats;
  } catch (error) {
    console.error('Failed to fetch Tubidy video data:', error.message);
  }
}



router.get('/songs/home', async (req, res) => {
  try {
    //  const proxy = await fetchProxy(req);
    //    console.log('Using proxy:', proxy);
    const url = 'https://tubidy.ac/';
    const { data: html } = await axios.get(url, {
      //proxy,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(html);

    function extractSongs(sectionTitle) {
      const section = $(`h2:contains("${sectionTitle}")`).parent().next('.container');
      const songs = [];
      section.find('.card').each((_, card) => {
        const $card = $(card);
        const url = $card.find('a').attr('href');
        const link = url.startsWith('https://tubidy.ac/download/')
          ? url.replace('https://tubidy.ac/download/', '')
          : url;

        const img = $card.find('img').attr('data-src');
        const title = $card.find('h3').text().trim();
        const duration = $card.find('.duration span').text().trim();
        songs.push({ title, link, img, duration });
      });
      return songs;
    }

    const result = {
      'New Releases': extractSongs('New Releases'),
      'Featured': extractSongs('Featured'),
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching songs:', error.message);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});


router.get('/:slug/:type/:id', async (req, res, next) => {
  let { slug, type, id } = req.params;

  let url = `https://tubidy.ac/download/${slug}/${type}/${id}`;
  console.log('Fetching URL:', url);

  if (!url) {
    return res.status(400).json({ error: 'Valid Tubidy URL is required in query parameter ?url=' });
  }

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(html);



    // Extract main song info
    const mainCard = $('.download-data .card').first();
    const mainImg = mainCard.find('img[data-src]').attr('data-src');
    const mainTitle = mainCard.find('.card-title').text().trim();
    const mainDuration = mainCard.find('.video-duration span').text().trim();
    const downloadBtn = mainCard.find('#downloadBtn');

    const acceptsJson = req.headers['accept']?.includes('application/json');


    if (acceptsJson) {
      // Flutter or API consumer – return JSON
      return res.status(200).json({
        title: mainTitle,
        img: mainImg,
        duration: mainDuration,
      });
    }

    const downloadData = await fetchTubidyVideoData(`https://tubidy.ac/get-video-data?data=${downloadBtn.attr('data-video-data')}`);
    const downloadText = downloadBtn.text().trim();

    const mainSong = {
      link: `${slug}/${type}/${id}`,
      title: mainTitle,
      img: mainImg,
      duration: mainDuration,
      downloadText,
      downloadData,
    };

    // Extract related songs
    const related = [];
    $('.playlist .card').each((_, card) => {
      const $card = $(card);
      const url = $card.find('a').attr('href');
      const link = url.startsWith('https://tubidy.ac/download/')
        ? url.replace('https://tubidy.ac/download/', '')
        : url;
      const img = $card.find('img[data-src]').attr('data-src');
      const title = $card.find('h3').text().trim();
      const duration = $card.find('.duration span').text().trim();
      related.push({ title, link, img, duration });
    });

    req.music = {
      mainSong,
      related,
    };
    return next();
  } catch (err) {
    console.error('Error scraping:', err.message);
    res.status(500).json({ error: 'Failed to fetch song data' });
  }
}, renderMusic);

router.get('/:key/:value', async (req, res, next) => {
  const { key, value } = req.params;

  const url = `https://tubidy.ac/${key}/${value}`;

  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(html);

  // Meta tags
  const meta = {};
  $('meta').each((_, el) => {
    const name = $(el).attr('name') || $(el).attr('property');
    const content = $(el).attr('content');
    if (name && content) meta[name] = content;
  });

  // Main info
  const mainTitle = `Free ${value} Playlists`;
  const subtitle = `Enjoy a Free ${value} Playlists – Pure Vibes  That Moves You`;
  const description = key === 'mood' ? `Explore the Ultimate ${value} Playlists — A handpicked collection of music playlists designed to match your vibe. Whether you're looking to relax, energize, focus, or unwind, this playlist captures the essence of ${value} moments. Let the music set the tone and elevate your day.` :
    `Dive into the world of ${value} music with a curated selection of music playlists that capture its unique rhythm and soul. From iconic tracks to fresh releases, these playlists is your go-to guide to the best in ${value}.`;
  const playlistCount = $('.pl-2.font-weight-light').first().text().trim();

  // Playlists
  const playlists = [];
  $('.playlist .card.mb-4').each((_, el) => {
    const card = $(el);
    const a = card.closest('a');
    const img = card.find('img[data-src]');
    const url = a.attr('href');
    const link = url.startsWith('https://tubidy.ac/')
      ? url.replace('https://tubidy.ac/', 'all/')
      : url;
    playlists.push({
      title: card.find('h3').text().trim(),
      link,
      img: img.attr('data-src'),
      alt: img.attr('alt')
    });
  });
  req.data = {
    meta,
    key,
    value,
    mainTitle,
    subtitle,
    description,
    playlistCount,
    playlists
  };

  return next();
}, renderClassification);

router.get('/all/playlist/:key/:value', async (req, res, next) => {
  const { key, value } = req.params;
  const url = `https://tubidy.ac/playlist/${key}/${value}`;

  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(html);

  // Meta tags
  const meta = {};
  $('meta').each((_, el) => {
    const name = $(el).attr('name') || $(el).attr('property');
    const content = $(el).attr('content');
    if (name && content) meta[name] = content;
  });

  // Playlist main info
  const card = $('.card.mb-3').first();
  const coverImg = card.find('img[data-src]').attr('data-src');
  const coverAlt = card.find('img[data-src]').attr('alt');
  const linked = `all/playlist/${key}/${value}`;
  const title = card.find('h2.card-title').text().trim();
  const playlistInfo = card.find('.card-text.text-muted').text().trim();
  const description = card.find('.card-text').last().text().trim();

  // Tracks
  const tracks = [];
  $('.playlist .card.mb-4').each((_, el) => {
    const $el = $(el);
    const a = $el.find('a').first();
    const img = a.find('img[data-src]');
    const url = a.attr('href');
    const link = url.startsWith('https://tubidy.ac/download/')
      ? url.replace('https://tubidy.ac/download/', '')
      : url;
    tracks.push({
      title: a.find('h3').text().trim(),
      link,
      img: img.attr('data-src'),
      alt: img.attr('alt'),
      duration: a.find('time.duration span').text().trim()
    });
  });

  req.data = {
    meta,
    link: linked,
    coverImg,
    coverAlt,
    title,
    playlistInfo,
    description,
    tracks
  };

  return next();
}
  , renderPlayList);

router.get('/search', async (req, res, next) => {

  const { query, pageToken, direction } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing search query (?query=)' });
  }

  let url = `https://tubidy.ac/search/${query}`;

  if (pageToken) {
    url += `?pageToken=${pageToken}`;

    if (direction) {
      url += `&direction=${direction}`;
    }
  }

  console.log('Fetching search results from:', url);
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const $ = cheerio.load(html);

  // Get all suggested songs
  const songs = [];
  $('.playlist .card').each((_, card) => {
    const $card = $(card);
    const url = $card.find('a').attr('href');
    const link = url.startsWith('https://tubidy.ac/download/')
      ? url.replace('https://tubidy.ac/download/', '')
      : url;
    const img = $card.find('img[data-src]').attr('data-src');
    const title = $card.find('h3').text().trim();
    const duration = $card.find('.duration span').text().trim();
    songs.push({ title, link, img, duration });
  });

  // Get next and prev button links
  let nextUrl = null, prevUrl = null;
  $('.col-12 .btn.btn-primary').each((_, btn) => {
    const text = $(btn).text().toLowerCase();
    const href = $(btn).attr('href');
    if (text.includes('next')) nextUrl = href.replace('https://tubidy.ac/search/', '');
    if (text.includes('prev')) prevUrl = href.replace('https://tubidy.ac/search/', '');
  });

  req.data = {
    query,
    songs,
    nextUrl,
    prevUrl
  };
  return next();
}

  , renderSearch);

module.exports = router;
