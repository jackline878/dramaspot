const { Article, Section, SectionContent, User, Hashtag, Category, Subcategory, UserInteraction, Activity, Celebrity, Insight, Extra } = require('../models');
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
async function expandSection(title, paragraph, mainKeyword, otherKeywords) {
  const expansionPrompt = `Expand this blog section to be at least 300 words that sounds human, is informative and helpful, and passes AdSense quality. Maintain quality, relevance, and tone (casual but professional tone).\n\nOriginal paragraph:\n${paragraph}.
  ${mainKeyword && mainKeyword.trim() !== "" ? `Write a blog article using SEO keywords.
  Main seo keyword: ${mainKeyword} (only if possible, try and use 2–3 times in the first 100 words incase this blog section sounds like introduction section)` : ``}
  ${otherKeywords && otherKeywords.trim() !== "" ? `Supporting seo keywords: ${otherKeywords}` : ``}
${mainKeyword && mainKeyword.trim() !== "" ? `Sprinkle each keyword 2–3 times depending on section length.` : ``}
  `;
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: expansionPrompt }],
  });
  return completion.choices[0].message.content.trim();
}

async function postArticle(fields) {

  const title = fields.title;
  const excerpt = fields.excerpt;
  const status = 'draft'; // Default status
  const read_duration = parseInt(fields.read_duration, 10) || 5;
  const published_at = new Date(fields.published_at) || new Date().toISOString();
  const tags = fields.hashtags

  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const article = await Article.create({
    title,
    userId: fields.userId,
    slug,
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

async function postSection(order, articleId) {
  try {
    // Check if the article exists
    const article = await Article.findByPk(articleId);
    if (!article) {
      return 'Article not found';
    }

    // Create the new section
    const newSection = await Section.create({
      articleId,
      order,
    });

    return newSection.id;

  } catch (err) {
    console.error(err);
    return 'Server error while creating section';
  }
};

async function postSectionContent(content, type, sectionId) {

  if (type === 'carousel') {
    const captions = content.captions;

    const mediaContent = captions.map((image, i) => ({
      image,
      caption: captions[i] || ''
    }));

    content = mediaContent;

    await SectionContent.create({
      sectionId,
      type: type,
      content: JSON.stringify(content)
    });
    return 'success';
  }
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


  const mainPrompt = `
Write a detailed blog article in JSON format about "${title}" that sounds human, includes real-life examples, is informative and helpful, and passes AdSense quality. Use a casual but professional tone.
${sample && sample.trim() !== "" ? `Extract info from this sample and use it to write that article, do thorough research and avoid copyright and misinformation, sample is: (${sample})` : ``}
${mainKeyword && mainKeyword.trim() !== "" ? `Write a blog article using SEO keywords.
  Main keyword: ${mainKeyword} (must appear in the title, 2–3 times in the excerpt/meta description, and 2–3 times in the introduction’s first 100 words).
  ` : ``}
${otherKeywords && otherKeywords.trim() !== "" ? `Supporting keywords: ${mainKeyword}` : ``}
${mainKeyword && mainKeyword.trim() !== "" ? `Use keywords naturally in some section headings.

Sprinkle each keyword 2–3 times in the body text, depending on section length.` : ``}
${hint || ""}

Return your response strictly in valid JSON with this structure:

{
  "title": string,
  "excerpt": string(150–160 characters),
  keywords: string(separated by commas),
  "hashtags": string[],
  "sections": [
    {
      "title": string,
      "subtitle": string (optional),
      "paragraph": string (optional),
      "list": {
        "items": string[],
        "is_ordered": boolean
      } (optional),
      "quote": {
        "quote": string,
        "attribution": string
      } (optional),
      "table": {
        "headers": string[],
        "rows": string[][]
      } (optional),
      "image": {
        "caption": string,
        "image": "image-placeholder.jpg"
      } (optional),
      "embed": {
        "url": string,
        "caption": string,
        "align": string
      } (optional),
      "slide": {
        "images": [{ "url": string, "caption": string }]
      } (optional),
      "carousel": {
        "media": string[],
        "captions": string[]
      } (optional),
      "video": {
        "caption": string,
        "video": "video-placeholder.mp4"
      } (optional)
    }
  ]
}

Each section should be at least 300 words. Return only the valid JSON.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: mainPrompt }],
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

    // Expand short paragraphs
    for (const section of json.sections) {
      if (section.paragraph) {
        if (wordCount(section.paragraph) < 250) {
        section.paragraph = await expandSection(section.title, section.paragraph, mainKeyword, otherKeywords);
        }
        section.paragraph = await getRewrittenContent(section.paragraph);
      }
    }

    // Save main article
    const articleId = await postArticle({
      title: json.title,
      excerpt: json.excerpt,
      userId: req.userData.userId,
      read_duration: 5,
      published_at: new Date().toISOString(),
      hashtags: json.hashtags
    });

    if (!articleId) {
      return res.status(500).send("❌ Failed to create article in database.");
    }

    // Process and save sections
    for (let i = 0; i < json.sections.length; i++) {
      const section = json.sections[i];
      const sectionId = await postSection(i, articleId);
      if (!sectionId) {
        return res.status(500).send("❌ Failed to create section in database.");
      }

      // Save title and subtitle as separate headers if both exist
      if (section.title) {
        await SectionContent.create({
          sectionId,
          type: 'head',
          content: JSON.stringify({ head: section.title, level: 2 })
        });
      }

      if (section.subtitle) {
        await SectionContent.create({
          sectionId,
          type: 'head',
          content: JSON.stringify({ head: section.subtitle, level: 4 })
        });
      }

      if (section.paragraph) {
        await SectionContent.create({
          sectionId,
          type: 'text',
          content: JSON.stringify({ text: section.paragraph })
        });
      }

      if (section.list && Array.isArray(section.list.items)) {
        await SectionContent.create({
          sectionId,
          type: 'list',
          content: JSON.stringify({
            items: section.list.items,
            isOrdered: !!section.list.is_ordered
          })
        });
      }

      if (section.quote) {
        await SectionContent.create({
          sectionId,
          type: 'quote',
          content: JSON.stringify({
            quote: section.quote.quote,
            attribution: section.quote.attribution
          })
        });
      }

      if (section.table && section.table.headers && section.table.rows) {
        await SectionContent.create({
          sectionId,
          type: 'table',
          content: JSON.stringify({
            table: {},
            headers: section.table.headers,
            rows: section.table.rows
          })
        });
      }

      if (section.image) {
        await SectionContent.create({
          sectionId,
          type: 'image',
          content: JSON.stringify({
            caption: section.image.caption,
            image: section.image.image
          })
        });
      }

      if (section.video) {
        await SectionContent.create({
          sectionId,
          type: 'video',
          content: JSON.stringify({
            caption: section.video.caption,
            video: section.video.video
          })
        });
      }

      if (section.embed) {
        await SectionContent.create({
          sectionId,
          type: 'embed',
          content: JSON.stringify({
            url: section.embed.url,
            caption: section.embed.caption,
            align: section.embed.align || 'center'
          })
        });
      }

      if (section.slide && Array.isArray(section.slide.images)) {
        await SectionContent.create({
          sectionId,
          type: 'slider',
          content: JSON.stringify({
            images: section.slide.images
          })
        });
      }

      if (section.carousel && section.carousel.media && section.carousel.captions) {
        await SectionContent.create({
          sectionId,
          type: 'carousel',
          content: JSON.stringify({
            media: section.carousel.media,
            captions: section.carousel.captions
          })
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
        <a class="button" href="/editor?id=${articleId}">Continue to Edit</a>
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

