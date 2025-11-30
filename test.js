
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
  fetchSearchResults('https://tubidy.ac/search/diamond+new+song?pageToken=eyJpdiI6IkJKeXlpUHBpRWpIM010ejY0bmx5anc9PSIsInZhbHVlIjoidnVtVGRKMmF1dlhKSXdGcGROeWRac3MwRENNRDhCYkh3MTg3M3FFSzJzZTZoa2pJV2hHM2MwREY5T3F4MFozVFNBN3ltTlpHMWlCR2FET3VpL0FQSU1RWmt2d0U5WERwQTJBTVB1NFhCQzUydXZ0Mktnc3RCTC93Qi9RMlNBRTMvVFYzR29BTldQVFNWcFYwcEJRR0NRQWhwellxVW05NFpsUFc2OUJDTEdabnErTVE2YnNHQlA5SWNHWExzRStjNUc0aS9FdGVGWEtBTXJiKzcyWk53bnpxUWc3L3Y3N0k0a1ZjRzd0WGNKcUNtQU5waG1WLzhWNnZraHd0N0trTzBZaE40UXZIUWJaMWNKK3Z2N04wT2NhOE5KcG55R3VBT3htcXZDeDVmdFE3dGg5dUVFemdjTUgwbytDOFltS3psVVJSNXM3WURzbGo0RHhnRVh2eUhoeTdERnJaL3JtQkNaMEFOUE8vVVBQUzg4VGdZVG1iZ2lLb21udGE0bWN6S3RFcHRkNzBBQ1FiUXNEMnhyRHAxWkxzb01nTTlZa1dHazl5WnlEYmp5RlByL28yeWFidGVFMEhwN05oaU9NdjJMU05jNmZvUTNDd2YxYTNoVXY3LzBXaHpBNUQ1L3ZiMmdiclFaNmdOcis3SGtkSkNDSmplVm9ycVVBRWtnNVFmNms2SmZTKy8wUDNqeXNJMjU1dDQ4ZS9HMDNmRjZOd0FMMGZXUlFwZVVpY25aeHZLYTMrSXFYbUpoNEpQUytJTHNDMjRNOUtaRVVvZUl2dGtTSkFiMVFPUWd2eWl1WUhRVWdlOWM0aTViMWxzUmY3ZE1MbkROb3ZnTDRxbHo5bE5qeWsyUXNQcVBXamROdktFN0crR2wwM3N4U0hUazNDeUgrVTN1bXQyMXlUc0lFdzJyOU9VVWhGdGNvUnlScWY3SE1MMGdVSzdyV1h6enF4R0t6UURoNVVtRjRsdmtIWkV0U2lhV3dpaWZYQlRDcVpmczcyNjNHaVY2MVRBUHliUTRvVjBGWnQ1akp1cHZwZk9ZNlFtR1VxVnV0dU10RzloZ0JMQjgzNCt2ST0iLCJtYWMiOiI0NjUxNWFlYjczNDk1YjQ0NDlmNDUwZWY0ZWQxNWY3ZWFjOTBhZjBlOTZiNDJmNzIxMTJlMGJhZTc2OWUyMjg0IiwidGFnIjoiIn0%3D&direction=next')
    .then(console.log)
    .catch(console.error);
  
