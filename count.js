const axios = require('axios');
const cheerio = require('cheerio');

async function countWordsOnWebsite(url) {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    // Select only the <article> tag
    const $article = $('article').first();

    if (!$article.length) {
      console.warn('⚠️ No <article> tag found. Returning 0.');
      return 0;
    }

    // Remove non-content elements inside the article
    $article.find(
      `
      script,
      style,
      noscript,
      iframe,
      svg,
      canvas,
      meta,
      link,
      .comments-section,
      #comments,
      #addCommentForm,
      .like-btn,
      .like-count,
      .comment-form,
      .comment-box,
      #share-facebook,
      #share-instagram,
      #share-whatsapp,
      #share-twitter,
      #share-telegram,
      #share-linkedin,
      #copy-link-btn,
      #copy-link-msg
      `
    ).remove();

    // Optional: remove any <section> in article with "comments" or "share"
    $article.find('section').each((i, el) => {
      const sectionText = $(el).text().toLowerCase();
      if (
        sectionText.includes('share this article') ||
        sectionText.includes('comments')
      ) {
        $(el).remove();
      }
    });

    // Extract and clean the article text
    const text = $article.text();
    const cleanText = text
      .replace(/\s+/g, ' ')        // collapse whitespace
      .replace(/[\r\n\t]+/g, ' ')  // remove line breaks/tabs
      .trim();

    // Count the words
    const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;

    console.log(`✅ Total Words in <article> from ${url}: ${wordCount}`);

    return wordCount;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return 0;
  }
}

module.exports = countWordsOnWebsite;
