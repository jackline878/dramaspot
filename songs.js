const axios = require('axios');
const cheerio = require('cheerio');

async function fetchSongs() {
  const url = 'https://tubidy.ac/';
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const $ = cheerio.load(html);

  // Helper to extract songs from a section
  function extractSongs(sectionTitle) {
    const section = $(`h2:contains("${sectionTitle}")`).parent().next('.container');
    const songs = [];
    section.find('.card').each((_, card) => {
      const $card = $(card);
      const link = $card.find('a').attr('href');
      const img = $card.find('img').attr('data-src');
      const title = $card.find('h3').text().trim();
      const duration = $card.find('.duration span').text().trim();
      songs.push({ title, link, img, duration });
    });
    return songs;
  }

  // Extract categorized/grouped songs
  const result = {
    'New Releases': extractSongs('New Releases'),
    'Featured': extractSongs('Featured'),
  };

  console.log(result);
  return result;
}

fetchSongs().catch(console.error);



const axios = require('axios');
const cheerio = require('cheerio');

async function fetchSongAndRelated(url) {
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
  const downloadData = downloadBtn.attr('data-video-data');
  const downloadText = downloadBtn.text().trim();

  const mainSong = {
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
    const link = $card.find('a').attr('href');
    const img = $card.find('img[data-src]').attr('data-src');
    const title = $card.find('h3').text().trim();
    const duration = $card.find('.duration span').text().trim();
    related.push({ title, link, img, duration });
  });

  return { mainSong, relatedSongs: related };
}

// Example usage:
fetchSongAndRelated('https://tubidy.ac/download/bien-all-my-enemies-are-suffering/video/2ulPWJZNVYH')
  .then(console.log)
  .catch(console.error);



  const axios = require('axios');
  const cheerio = require('cheerio');
  
  async function fetchSearchResults(url) {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const $ = cheerio.load(html);
  
    // Get all suggested songs
    const songs = [];
    $('.playlist .card').each((_, card) => {
      const $card = $(card);
      const link = $card.find('a').attr('href');
      const img = $card.find('img[data-src]').attr('data-src');
      const title = $card.find('h3').text().trim();
      const duration = $card.find('.duration span').text().trim();
      songs.push({ title, link, img, duration });
    });
  
    // Get next and prev button links
    let next = null, prev = null;
    $('.col-12 .btn.btn-primary').each((_, btn) => {
      const text = $(btn).text().toLowerCase();
      const href = $(btn).attr('href');
      if (text.includes('next')) next = href;
      if (text.includes('prev')) prev = href;
    });
  
    return { songs, next, prev };
  }
  
  // Example usage:
  fetchSearchResults('https://tubidy.ac/search/diamond%2Bplatnumz%2Bnew%2Bsong?pageToken=eyJpdiI6Im5vSkFIc1NLWEQzZjNUWk1lVFhmb0E9PSIsInZhbHVlIjoiU1cyWFhKeTdQczFhbDRCYXVJTVB0RXFkVjNIS1h6VnQ1VkRoaS9ja2lrMW9iT3FpZ1N5c2dBR1pKdzdrdm0wa1UzbkRiNDQ2aEt5QngzZE1QeXA3V0p5Mi80USt1RW4weCttc0NIZHNCa1E0R0Z1enBTVlg4bVh3VTFvd1M5clJ3Sm93MFRtM3F1R01TdVdCa1BUd1haQzNGWUhEMitCeDBGNnhxZ3Q5QWVPRmVPeVNXTGhBbTVlQWVpeldoNWt3YjAvWUY1dW5ZNUE4akNqU1NTaEFDQWNPaEp4MlRmbW5lbTBYRTd0MVEyVDhLa1dVNTh0Qy9POFdWVk1uQXRIT3pVSjZ4S3VnVTFMMWQ2UXVETGxRc2hIOUltRWw1VkI5ZG8yL0tac2NNalN1Y2xyblhSd1hOVnhnK29LcmxIREtuZk1kWlU5RDBKK0R3bkZUWkprVG1tUWxsTGtTNlY2REhuT2FtN2hiSEpPbXphNGZob1dTVjlFSytGSEhMb0lkaURhMXN1SnpTVE92bGQxVjNsbXpjNXdhREFxSTEyTVh2UDk3VnBEMFJ0aUs5cUdjTm5zekZ4eVJlTTNkU2JTeTJOczdPaXZiQXlmU3JZdG96bHUzbjN2dWFIRDM2R1k5d3RGWDcrQXpjeHFaU2NGaXdaSmlqbHQwSzFOZGNtZUMzajMveVNjVU9zR1lhcmJjY203dEU0T2RTaTgxRXQvOXd3ZDRadzBXQWYxckJheGNiREVIVkFYN3IzaWdqa1ZTd2s3eDNHa0FpK0c2ZjBNYWgyNDU5RXlLeitNTGhCRjU5TVhUTURoZFduSytyTGw5RFdlaGNFQ1dEMWw5Sm4zalB3MTJGcDF3eGQzVGY2cVgxbjV0bTJBSlV4QmNQUmIyY1NsUWIrREhIVmZucVd4YnJHSGxjRHlOSFVQZU55V2s0UTVnUmlrTHVRNnVxWklPVzVuNDUxSThiV3lDNUtPOVlFUE9vLzQxVUVyRUQyenVHZTdiRUlQZ1NUaHRQd0xUbDRKbHRJVHRyUXFUbVBhc09NWENBdHRXVFZLUnFkY2VHam12UGdkeW94TTRsM0U1QnNDb1gybGQ4cSt4VUNrVCIsIm1hYyI6IjhlOTkwNDk0YmMwOTQwZWY2OGU5MjI2ZDY3ZmZlN2U2OWFjYjdjNDNiZjcxMWJhYzVlYTZkMzQ3NTUzZjdkZTIiLCJ0YWciOiIifQ%3D%3D&direction=next')
    .then(console.log)
    .catch(console.error);
  


    const axios = require('axios');
    const cheerio = require('cheerio');
    
    async function fetchAfricanGenrePage(url) {
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
    
        // Main heading and description
        const heading = $('h1').first().text().trim();
        const genre = $('h2').first().text().trim();
        const description = $('.container.text-center.mb-2.mt-2 p').first().text().trim();
        const playlistCount = $('.pl-2.font-weight-light').first().text().trim();
    
        // Playlists
        const playlists = [];
        $('.playlist .card').each((_, card) => {
            const $card = $(card);
            const parentA = $card.closest('a');
            playlists.push({
                title: $card.find('h3').text().trim(),
                link: parentA.attr('href'),
                img: $card.find('img').attr('data-src'),
                alt: $card.find('img').attr('alt')
            });
        });
    
        return {
            meta,
            heading,
            genre,
            description,
            playlistCount,
            playlists
        };
    }
    
    // Example usage:
    fetchAfricanGenrePage('https://tubidy.ac/genre/african')
        .then(console.log)
        .catch(console.error);
    

        const axios = require('axios');
        const cheerio = require('cheerio');
        
        async function fetchPlaylistPage(url) {
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
          const title = card.find('h2.card-title').text().trim();
          const playlistInfo = card.find('.card-text.text-muted').text().trim();
          const description = card.find('.card-text').last().text().trim();
        
          // Tracks
          const tracks = [];
          $('.playlist .card.mb-4').each((_, el) => {
            const $el = $(el);
            const a = $el.find('a').first();
            const img = a.find('img[data-src]');
            tracks.push({
              title: a.find('h3').text().trim(),
              link: a.attr('href'),
              img: img.attr('data-src'),
              alt: img.attr('alt'),
              duration: a.find('time.duration span').text().trim()
            });
          });
        
          return {
            meta,
            playlist: {
              coverImg,
              coverAlt,
              title,
              playlistInfo,
              description
            },
            tracks
          };
        }
        
        // Example usage:
        fetchPlaylistPage('https://tubidy.ac/playlist/soul-stripped/VLRDCLAK5uy_kFR_dUAeIwAH_KMLOVWjd0Vd-8pviVMCQ')
          .then(console.log)
          .catch(console.error);
        



          const axios = require('axios');
          const cheerio = require('cheerio');
          
          async function fetchMoodPlaylistsPage(url) {
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
            const mainTitle = $('.mans h1').first().text().trim();
            const subtitle = $('h2.mt-2.p-2').first().text().trim();
            const description = $('.container.text-center.mb-2.mt-2 p').first().text().trim();
            const playlistCount = $('.pl-2.font-weight-light').first().text().trim();
          
            // Playlists
            const playlists = [];
            $('.playlist .card.mb-4').each((_, el) => {
              const card = $(el);
              const a = card.closest('a');
              const img = card.find('img[data-src]');
              playlists.push({
                title: card.find('h3').text().trim(),
                link: a.attr('href'),
                img: img.attr('data-src'),
                alt: img.attr('alt')
              });
            });
          
            return {
              meta,
              mainTitle,
              subtitle,
              description,
              playlistCount,
              playlists
            };
          }
          
          // Example usage:
          fetchMoodPlaylistsPage('https://tubidy.ac/mood/chill')
            .then(console.log)
            .catch(console.error);
          