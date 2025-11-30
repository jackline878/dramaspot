const { Article, Section, SectionContent, User, Hashtag, Category, Subcategory, UserInteraction, Activity, Celebrity, Insight, ArticleContent } = require('../models');
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const rewriteContent = require('../rewriter');
const { Op } = require('sequelize');
const slugify = require('slugify');

function prepareCelebrityProfilePayload(body) {
  const { fullName, nickname } = body;
  const slug = slugify(nickname || fullName, { lower: true, strict: true });
  return {
    fullName: body.fullName?.trim() || '',
    nickname: body.nickname?.trim() || '',
    profilePic: body.profilePic || 'https://www.seekpng.com/png/detail/41-410093_circled-user-icon-user-profile-icon-png.png',
    coverPic: body.coverPic || 'https://www.seekpng.com/png/detail/41-410093_circled-user-icon-user-profile-icon-png.png',
    dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
    placeOfBirth: body.placeOfBirth?.trim() || '',
    slug: slug,
    networth: isNaN(parseFloat(body.networth)) ? 0 : parseFloat(body.networth),
    nationality: body.nationality?.trim() || '',
    roles: body.roles ? JSON.stringify(body.roles) : JSON.stringify([]),
    careerBackground: body.careerBackground?.trim() || '',
    bio: body.bio?.trim() || '',
    relationshipStatus: body.relationshipStatus?.trim() || '',
    familyBackground: body.familyBackground?.trim() || ''
  };
}

function prepareCelebrityPayload(body, id) {
  const jsonFields = [
    'careerAchievements',
    'careerTimeline',
    'albums',
    'concerts',
    'brands',
    'awards',
    'nominations',
    'records',
    'awardGallery',
    'children',
    'friends',
    'personalInsights',
    'assets',
    'philanthropy',
    'news',
    'funFacts'
  ];

  const plainFields = {
    celebrityId: id || null,
    partner: body.partner || '',
    careerStatus: body.careerStatus || '',
    careerStart: body.careerStart || '',
    careerBreakthrough: body.careerBreakthrough || '',
    family: body.family || ''
  };

  // Add all JSON fields safely
  jsonFields.forEach(key => {
    plainFields[key] = body[key] ? JSON.stringify(body[key]) : JSON.stringify([]);
  });

  return plainFields;
}


async function getRewrittenContent(content) {
  try {
    const result = await rewriteContent(content);
    if (result?.data) {
      if(result.data === "" || result.data === null) {
        return content;
      }
      return result.data; // cleaned rewritten text
    } else {
      return content; // fallback if structure differs
    }
  } catch (err) {
    console.error("❌ Error rewriting content:", err.message);
    return content;
  }
}

const checkAuthMiddleware = require('../middlewares/check-auth');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Utility: count words
const wordCount = (text) => (text || '').split(/\s+/).filter(Boolean).length;

// Utility: expand short paragraph
async function makeRawArticle(title, mainKeyword, otherKeywords, hint, sample) {
   const mainPrompt = `
    You are an expert content writer and SEO specialist. Create a detailed, well-structured and long article on the topic: "${title}". ${hint || ""} ${sample ? `Use this sample as reference: ${sample}` : ""} Do thorough research and avoid copyright and misinformation. search for the most relevant, accurate, and up-to-date information as per today's date.
    make it sounds human, includes real-life examples, is informative and helpful, and passes AdSense quality. Use a casual but professional tone.
    ${mainKeyword && mainKeyword.trim() !== "" ? `Write a blog article using SEO keywords.
      Main keyword: ${mainKeyword} (must appear in the title, 2–3 times in the excerpt/meta description, and 2–3 times in the introduction’s first 100 words).
      ` : ``}
    ${otherKeywords && otherKeywords.trim() !== "" ? `Supporting keywords: ${mainKeyword}` : ``}
    ${mainKeyword && mainKeyword.trim() !== "" ? `Use keywords naturally in some paragraphs headings if any.

    Sprinkle each keyword 2–3 times in the body text, depending on body length.` : ``}
   `;

   const completion = await openai.chat.completions.create({
     model: 'gpt-3.5-turbo',
     messages: [{ role: 'user', content: mainPrompt }],
    });
   return completion.choices[0].message.content.trim();
}

async function postArticle(fields) {

  const title = fields.title;
  const excerpt = fields.excerpt;
  const keywords = fields.keywords || '';
  const status = 'draft'; // Default status
  const read_duration = parseInt(fields.read_duration, 10) || 5;
  const published_at = new Date(fields.published_at) || new Date().toISOString();
  const tags = fields.hashtags

  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const article = await Article.create({
    title,
    userId: fields.userId,
    slug,
    keywords,
    image: 'https://res.cloudinary.com/drltycycg/image/upload/v1753872094/null_adp0mu.jpg',
    excerpt,
    status,
    read_duration,
    published_at,
  });

  await Activity.create({
    type: 'publish',
    user_id: fields.userId,
    message: `published a new article`,
  });

  const hashtags = [];
  for (const tag of tags) {
    const [hashtag] = await Hashtag.findOrCreate({ where: { name: tag } });
    hashtags.push(hashtag);
  }
  await article.addHashtags(hashtags);
  return article.id;
};


// GET form page
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>AI Article Generator</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f7f7f7;
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
        }
        form {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          max-width: 600px;
          margin: auto;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        label {
          font-weight: bold;
          margin-top: 10px;
          display: block;
        }
        input, textarea {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-size: 16px;
          box-sizing: border-box;
        }
        textarea {
          min-height: 120px;
        }
        button {
          background: rgb(252, 5, 120);
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          font-size: 16px;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .loading {
          display: none;
          text-align: center;
          margin-top: 15px;
          color: rgb(252, 5, 120);
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h2>Generate Article with AI</h2>
      <form method="POST" action="/ai" onsubmit="showLoading()">
        
        <label>Title</label>
        <input type="text" name="title" placeholder="e.g. Smart Glasses 2025: The Future of AR Wearables" required />
        
        <label>Main Keyword</label>
        <input type="text" name="mainKeyword" placeholder="e.g. Smart glasses 2025" required />
        
        <label>Other Keywords (comma separated)</label>
        <input type="text" name="otherKeywords" placeholder="e.g. AI smart glasses, Meta Ray-Ban glasses review, AR wearable technology, future of smart glasses" />
        
        <label>Hint (optional)</label>
        <textarea name="hint" placeholder="e.g. Make it SEO-optimized, conversational tone, copyright free..."></textarea>
        
        <label>Sample Article (optional)</label>
        <textarea name="sample" placeholder="Paste sample article from another site..."></textarea>
        
        <button type="submit" id="submitBtn">Generate</button>
        <div class="loading" id="loadingText">⏳ Generating article, please wait...</div>
      </form>

      <script>
        function showLoading() {
          document.getElementById('submitBtn').disabled = true;
          document.getElementById('loadingText').style.display = 'block';
        }
      </script>
    </body>
    </html>
  `);

});


router.post('/', checkAuthMiddleware.check, async (req, res) => {
  const { title, hint, sample, mainKeyword, otherKeywords } = req.body;

  const rawArticle = await makeRawArticle(title, mainKeyword, otherKeywords, hint, sample);
  const jsonPrompt = `
convert the following article into a structured JSON format with various content blocks like headings, paragraphs, lists, quotes, tables, images, videos, and embeds. Ensure the article is 900+ words long and SEO-optimized.
Article: ${rawArticle}
Return your response strictly in valid JSON with this structure:

{
  "title": string,
  "excerpt": string(150–160 characters),
  keywords: string(separated by commas),
  "hashtags": string[],
  "body": [
  // Each object represents a content block. Include at least 10 blocks if possible.
       { "head": {
        "order": int,
        "html": <html>, //outerhtml should be h2...6 and styled with bootstrap5
}}(optional),
       {  "text": {
        "order": int,
        "html": <html>, //outerhtml should be p and styled with bootstrap5 and more than 300 words (if less than 300 words, expand it)
      }}(optional),
      {  "list": {
        "order": int,
        "html": <html>, //outerhtml should be ul/ol and styled with bootstrap5
      }}(optional),
     {  "quote": {
        "order": int,
        "quote": string,
        "attribution": string
      }}(optional),
     {  "table": {
        "order": int,
        "headers": string[],
        "rows": string[][]
      }}(optional),
    {   "image": {
        "order": int,
        "caption": string,
        "image": "https://...jpg"
      }}(optional),
     {  "embed": {
        "order": int,
        "url": string,
        "caption": string,
        "align": string
      }}(optional),
     {  "video": {
        "order": int,
        "caption": string,
        "video": "https://...mp4"
      }}(optional),
]
}

Ensure the body is 900+ words long. Return only the valid JSON.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: jsonPrompt }],
    });


    let rawContent = completion.choices[0].message.content.trim();
    console.log('🔍 Raw content from OpenAI:\n', rawContent);

    // Extract between first "{" and last "}"
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.error('❌ Invalid JSON bounds. Could not locate valid JSON structure.');
      return res.status(500).send("❌ Failed to extract JSON from AI response.");
    }

    const jsonSlice = rawContent.slice(firstBrace, lastBrace + 1);

    let json;
    try {
      json = JSON.parse(jsonSlice);
    } catch (err) {
      console.error('❌ JSON parse error:', err.message);
      console.error('🧪 Attempted JSON:\n', jsonSlice);
      return res.status(500).send("❌ Failed to parse valid JSON from AI.");
    }

    console.log(json);

    // Save main article
    const articleId = await postArticle({
      title: json.title,
      keywords: json.keywords,
      excerpt: json.excerpt,
      userId: req.userData.userId,
      read_duration: 5,
      published_at: new Date().toISOString(),
      hashtags: json.hashtags
    });

    if (!articleId) {
      return res.status(500).send("❌ Failed to create article in database.");
    }

    for (const content of json.body) {

      // Expand short paragraphs
      if (content.text) {
        content.text = await getRewrittenContent(content.text);
      }

      if (content.head) {
        await ArticleContent.create({
          articleId,
          type: 'head',
          content: JSON.stringify({ html: content.head.html }),
          order: content.head.order
        });
      }

      if (content.text) {
        await ArticleContent.create({
          articleId,
          type: 'text',
          content: JSON.stringify({ html: content.text.html }),
          order: content.text.order
        });
      }

      if (content.list) {
        await ArticleContent.create({
          articleId,
          type: 'list',
          content: JSON.stringify({ html: content.list.html }),
          order: content.list.order
        });
      }

      if (content.table) {
        const table = document.createElement('table');
        table.className = 'table table-bordered table-striped table-hover align-middle text-center';
        table.innerHTML = `
      <thead>
        <tr>${(content.table.headers || []).map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${(content.table.rows || []).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
      </tbody>
    `;

        // Enforce min/max width
        table.querySelectorAll('td, th').forEach(cell => {
          cell.style.minWidth = "100px";
          cell.style.maxWidth = "200px";
          cell.style.wordBreak = "break-word";
        });

        // Wrap in scrollable container
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        wrapper.style.overflowX = "auto";
        wrapper.style.display = "block";
        wrapper.style.width = "100%";
        wrapper.style.maxHeight = "400px";
        wrapper.style.maxWidth = "100%";
        wrapper.style.boxSizing = "border-box";

        table.style.width = "max-content";
        table.style.maxWidth = "100%";

        wrapper.appendChild(table);

        await ArticleContent.create({
          articleId,
          type: 'table',
          content: JSON.stringify({ html: wrapper.outerHTML }),
          order: content.table.order
        });
      }

      if (content.quote) {
        await ArticleContent.create({
          articleId,
          type: 'quote',
          content: JSON.stringify({
            html: `
          <blockquote contenteditable="true"
          class="blockquote my-3 px-4 py-3 bg-light border-start border-4 border-danger rounded mb-4"
          data-placeholder="Quote...">
            <p class="mb-0">${content.quote.quote}</p>
            <footer class="blockquote-footer">${content.quote.attribution}</footer>
          </blockquote>
        `
          }),
          order: content.quote.order
        });
      }

      if (content.image) {
        await ArticleContent.create({
          articleId,
          type: 'image',
          content: JSON.stringify({
            caption: content.image.caption,
            image: content.image.image
          }),
          order: content.image.order
        });
      }

      if (content.video) {
        await ArticleContent.create({
          articleId,
          type: 'video',
          content: JSON.stringify({
            caption: content.video.caption,
            video: content.video.video
          }),
          order: content.video.order
        });
      }

      if (content.embed) {
        await ArticleContent.create({
          articleId,
          type: 'embed',
          content: JSON.stringify({
            url: content.embed.url,
            caption: content.embed.caption,
            align: content.embed.align || 'center'
          }),
          order: content.embed.order
        });
      }
    }


    // Send minimal HTML response for continuation
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${json.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #f9f9f9; }
          h1 { color: rgb(252, 5, 120); }
          a.button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background: rgb(252, 5, 120);
            color: white;
            text-decoration: none;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <h1>${json.title}</h1>
        <p><em>Your article has been created successfully.</em></p>
        <a class="button" href="/article/edit?id=${articleId}">Continue to Edit</a>
      </body>
    </html>`;

    res.send(html);

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).send("❌ Failed to generate or expand article.");
  }
});

// Utility: Paraphrase content
async function paraphraseContent(content) {
  const prompt = `Paraphrase the following content to make it clearer, more human, and helpful, keeping the same meaning.\n\n${content}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  return completion.choices[0].message.content.trim();
}
// POST to paraphrase updated section content
router.get('/paraphrase', async (req, res) => {
  try {
    const { content } = req.query;
    const revised = await paraphraseContent(content);
    res.json({ success: true, revised });
  } catch (error) {
    console.error('Paraphrasing error:', error.message);
    res.status(500).json({ success: false, message: 'Paraphrasing failed' });
  }
});

// GET form page
router.get('/celebrity/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Celebrity Profile Generator (AI)</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
        }
        form {
          background-color: #fff;
          max-width: 600px;
          margin: auto;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        label {
          display: block;
          margin-top: 15px;
          font-weight: bold;
        }
        input, textarea {
          width: 100%;
          padding: 12px;
          margin-top: 8px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 15px;
        }
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        button {
          margin-top: 20px;
          background-color: rgb(252, 5, 120);
          color: white;
          border: none;
          padding: 14px;
          font-size: 16px;
          border-radius: 6px;
          cursor: pointer;
          width: 100%;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .loading {
          display: none;
          text-align: center;
          margin-top: 20px;
          font-weight: bold;
          color: rgb(252, 5, 120);
        }
      </style>
    </head>
    <body>
      <h2>Generate a Celebrity Profile Using AI</h2>
      <form method="POST" action="/ai/celebrity/" onsubmit="showLoading()">
        <label for="user">Celebrity Name</label>
        <input type="text" id="user" name="user" placeholder="e.g. Rihanna" required />

        <label for="hint">Hint (optional)</label>
        <textarea id="hint" name="hint" placeholder="e.g. Focus on musical career, or early life details"></textarea>

        <label for="sample">Sample Data (optional)</label>
        <textarea id="sample" name="sample" placeholder="Paste content you want AI to consider..."></textarea>

        <button type="submit" id="submitBtn">Generate Profile</button>
        <div class="loading" id="loadingText">⏳ Generating data, please wait...</div>
      </form>

      <script>
        function showLoading() {
          document.getElementById('submitBtn').disabled = true;
          document.getElementById('loadingText').style.display = 'block';
        }
      </script>
    </body>
    </html>
  `);
});


const fields = {
  fullName: "What is the full name? BOT REQUEST: Return only a plain string. No commentary or explanation. Example: 'Mrs. Michele Dare II'",

  nickname: "What is the stageName/nickname? BOT REQUEST: Return only a plain string. No extra text. Example: 'Sedrick'",

  dateOfBirth: "When was the celebrity born? Format as 'YYYY-MM-DD'. BOT REQUEST: Return only a plain date string. Example: '1964-09-06'",

  placeOfBirth: "Where was the celebrity born? BOT REQUEST: Return only a plain string. Example: 'New Elvieland'",

  nationality: "What is their nationality? BOT REQUEST: Return only a plain string. Example: 'Thailand'",

  roles: "List their professional roles (e.g. musician, actor). BOT REQUEST: Return only a raw array of strings. Example: ['Musician', 'Actor'], choose one or more from: ['Musician','Singer','Rapper','Actor','Actress','Athlete','Footballer','Basketball Player','Tennis Player','Influencer','YouTuber','TikToker','Comedian','Politician','Entrepreneur','Model','Fashion Designer','TV Host','Director','Producer','Author','DJ','Philanthropist','Reality Star','Chef','Dancer','Visual Artist','Activist','Public Figure','TikTok Star','Content Creator','Social Media Influencer'].",

  bio: "Write a short biography (300+ words). BOT REQUEST: Return only a long plain text string. No headers, no bullet points, no formatting.",

  careerBackground: "What is their career background? BOT REQUEST: Return only a plain string. No markdown or explanation.",

  careerStatus: "What is their current career status? Indicate whether they have left their career(with reason) or are still active. If active, briefly state their current level, role, or milestone. ? BOT REQUEST: Return only a plain string. Example: 'Retired'",

  careerStart: "How did their career began? BOT REQUEST: Return only a plain string. Example: 'Started in 2000 as a singer'",

  careerBreakthrough: "What was their breakthrough moment? BOT REQUEST: Return only a plain string. No formatting or markdown. Example: 'Released first hit single in 2005'",

  careerAchievements: `List major career achievements. BOT REQUEST: Return only a raw JSON array with fields (year, title, description). Example:
[
  {
    "year": "2020",
    "title": "Awarded Best Engineer",
    "description": "Recognized for outstanding contributions in software development."
  },
  {
    "year": "2018",
    "title": "Promoted to Senior Manager",
    "description": "Led a high-performing team that delivered three successful product launches."
  }
]`,

  careerTimeline: `Provide a timeline of the person's career highlights.. BOT REQUEST: Return only a raw JSON array of objects with fields (year, event with 300+ words, title). Example:
[
  { "year": "7567", "event": "long and well explained description...300 words+", "title": "title..." },
  { "year": "3344", "event": "long and well explained description...300 words+", "title": "title..." }
]`,

  albums: `List their Major Works/Projects/albums/ Songs / Movies . BOT REQUEST: Return only a raw JSON array with fields (title, year, description, url). Example:
[
  { "title": "Napenda", "year": "2121", "description": "2121", "url": "2121" }
]`,

  concerts: `List notable performances such as concerts, shows, tours, or festival or special events appearances.. BOT REQUEST: Return only a raw JSON array with fields (name, year, description). Example:
[
  { "name": "ccdd", "year": "2233", "description": "dddd" }
]`,

  brands: `List brands the person has worked with through endorsements, collaborations, or partnerships. BOT REQUEST: Return only a raw JSON array with fields (brandName, year, description). Example:
[
  { "brandName": "ddssa", "year": "2330", "description": "qwerew" }
]`,

  awards: `List awards won. BOT REQUEST: Return only a raw JSON array with fields (name, year, description). Example:
[
  { "name": "jhdndj", "year": "3900", "description": "ncbcnv" }
]`,

  nominations: `List Nominations / Honorary Titles. BOT REQUEST: Return only a raw JSON array with fields (title, description). Example:
[
  { "title": "eewwrr", "description": "evdds" }
]`,

  records: `List notable records set or broken, or milestones achieved. BOT REQUEST: Return only a raw JSON array with fields (title, description). Example:
[
  { "title": "ddhdgf", "description": "kkkjshsn" }
]`,

  awardGallery: `Provide image URLs for awards the person has received. BOT REQUEST: Return only a raw JSON array with fields (url, caption). Example:
[
  { "url": "https://upload.wikimedia.org/...", "caption": "ggsfshssn" }
]`,

  relationshipStatus: "What is their current relationship status? BOT REQUEST: Return only a plain string. Example: 'Married'",

  children: `List names of children. BOT REQUEST: Return only a raw JSON array of strings. Example: ['jdhdjjjd']`,

  family: "Describe their family background. BOT REQUEST: Return only a plain string. No formatting or additional text.",

  friends: `List notable friends. BOT REQUEST: Return only a raw JSON array of strings. Example: ['dfdgdd']`,

  personalInsights: `List personal insights/Respectful summary of publicly known personal life details. BOT REQUEST: Return only a raw JSON array of objects with fields (title, description). Example:
[
  { "title": "fdfdgd", "description": "\\aassss" }
]`,

  networth: "What is their net worth calculated in dollars? BOT REQUEST: Return only a string in format '0.00'. No currency symbols. Example: '968.00'",

  assets: `List notable assets. BOT REQUEST: Return only a raw JSON array of objects with fields (name, worth). Example:
[
  { "name": "House", "worth": "56666" }
]`,

  philanthropy: `List notable philanthropy projects or charitable initiative involved in. BOT REQUEST: Return only a raw JSON array with fields (title, description). Example:
[
  { "title": "cvdvdd", "description": "hgdydt" }
]`,

  news: `List 2–3 relevant news articles. BOT REQUEST: Return only a raw JSON array of plain URL strings. Example: ['https://example.com/news-1']`,

  funFacts: `List fun or surprising facts about the person. BOT REQUEST: Return only a raw JSON array of key-value pairs. Example:
[
  { "key": "funn", "value": "vdgdd" }
]`
};


async function fetchFieldValue(fieldKey, question, user, hint, sample) {
  const prompt = `
You are generating data for a celebrity profile for: "${user}".
${sample ? `From the sample: ${sample}` : ""} ${question}
${hint || ""} Do thorough research and avoid copyright and misinformation. search for the most relevant, accurate, and up-to-date information as per today's date.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = completion.choices[0].message.content.trim();

  // Try to parse JSON for fields that expect JSON, else return as string
  if (
    [
      'roles', 'careerAchievements', 'careerTimeline', 'albums', 'concerts', 'brands',
      'awards', 'nominations', 'records', 'awardGallery', 'children', 'friends',
      'personalInsights', 'assets', 'philanthropy', 'news', 'funFacts'
    ].includes(fieldKey)
  ) {
    try {
      return JSON.parse(responseText);
    } catch (err) {
      console.error(`❌ JSON parse error for ${fieldKey}:`, err.message);
      return null;
    }
  }
  return responseText;
}

router.post('/celebrity/', checkAuthMiddleware.check, async (req, res) => {
  const { user, hint, sample } = req.body;

  const celebrityData = {};
  for (const [key, question] of Object.entries(fields)) {
    let value = await fetchFieldValue(key, question, user, hint, sample);
    celebrityData[key] = value;
    console.log(`🔍 Fetched:`, celebrityData);
  }

  // Final JSON is in the required format for DB
  try {
    const payload1 = prepareCelebrityProfilePayload(celebrityData);
    const celebrity = await Celebrity.create(payload1);

    let insights = await Insight.findOne({ where: { celebrityId: celebrity.id } });
    if (!insights) insights = await Insight.create({ celebrityId: celebrity.id });

    const payload = prepareCelebrityPayload(celebrityData, celebrity.id);
    await insights.update(payload);

    res.send(`
      <html><head><title>${celebrityData.fullName} - Profile Created</title></head>
      <body style="font-family: sans-serif; padding: 40px; background: #f9f9f9;">
        <h1 style="color: rgb(252, 5, 120);">${celebrityData.fullName}</h1>
        <p><em>Celebrity profile created successfully.</em></p>
        <a href="/celebrity/" style="background: rgb(252, 5, 120); color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Generate Another</a>
      </body></html>
    `);
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    res.status(500).send("❌ Failed to save celebrity data.");
  }
});



module.exports = router;

