const { Article, Section, SectionContent, User, Hashtag, Category, Subcategory, UserInteraction } = require('../models');
const clases = require('../classes');
const { Op, where, or } = require('sequelize');

// /controllers/article.controller.js


// Create a new article with sections and section contents
const fs = require('fs');
const path = require('path');
const e = require('express');
const https = require('https');

function pingSearchEngines(sitemapUrl) {
    const pingUrls = [
        `https://www.google.com/ping?sitemap=${sitemapUrl}`,
        `https://www.bing.com/ping?sitemap=${sitemapUrl}`
    ];

    pingUrls.forEach(url => {
        https.get(url, res => {
            console.log(`Pinged: ${url} - Status: ${res.statusCode}`);
        }).on('error', err => {
            console.error(`Ping failed: ${url}`, err.message);
        });
    });
}


const articlesFile = path.join(__dirname, '..', 'data', 'articles.json');

// Ensure articles.json exists
if (!fs.existsSync(articlesFile)) {
    fs.writeFileSync(articlesFile, JSON.stringify([]));
}


exports.createArticles = async (req, res) => {
    try {
        const fields = req.body;
        const files = req.files;

        // Core fields
        // Core fields
        const title = fields.title;
        const excerpt = fields.excerpt;
        const status = fields.status;
        const read_duration = parseInt(fields.read_duration, 10) || 0; // Default to 0 if not provided
        const published_at = fields.published_at;
        const subcategories = fields.subcategories ? JSON.parse(fields.subcategories) : [];
        const hashtags = JSON.parse(fields.hashtags || '[]');

        // Article image (optional)
        const articleImage = files.find(f => f.fieldname === 'image');

        // Parse sections

        const sections = [];

        for (let index = 0; index < JSON.parse(fields["sections"]).length; index++) {

            const order = parseInt(JSON.parse(fields["sections"])[index]["order"], 10);
            let contents = JSON.parse(fields["sections"])[index]["contents"] || [];

            for (let contentIndex = 0; contentIndex < contents.length; contentIndex++) {

                contents[contentIndex].content = JSON.parse(contents[contentIndex].content || '{}');

                if (contents[contentIndex].type === 'carousel') {
                    const media = files.filter(f => f.fieldname === `section${index}-content${contentIndex}-carrousel-image`).map(m => m.path);
                    const captions = JSON.parse(fields[`section${index}-content${contentIndex}-captions`] || '[]');
                    contents[contentIndex].content = { media, captions };

                } else if (contents[contentIndex].type === 'image') {
                    const mediaFile = files.find(f => f.fieldname === `section${index}-content${contentIndex}-image`);
                    if (mediaFile) {
                        contents[contentIndex].content.image = mediaFile.path;
                    } else {
                        contents[contentIndex].content.image = null;
                    }
                } else if (contents[contentIndex].type === 'video') {
                    const mediaFile = files.find(f => f.fieldname === `section${index}-content${contentIndex}-video`);
                    if (mediaFile) {
                        contents[contentIndex].content.video = mediaFile.path;
                    } else {
                        contents[contentIndex].content.video = null;
                    }
                }
            }
            sections.push({ order, contents });
        }
        const article = {
            title,
            userId: req.userData.userId,
            slug: title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), // Simple slug generation
            image: articleImage ? articleImage.path : null,
            excerpt,
            status,
            read_duration,
            published_at,
            categoryId,
            hashtags,
            sections
        }
        fs.writeFileSync(articlesFile, JSON.stringify(article, null, 2));

    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createArticle = async (req, res) => {
    try {
        const fields = req.body;
        const files = req.files;
        // Core fields
        const title = fields.title;
        const excerpt = fields.excerpt;
        const status = fields.status;
        const read_duration = parseInt(fields.read_duration, 10) || 0; // Default to 0 if not provided
        const published_at = fields.published_at !== '' ? fields.published_at : null;
        const subcategories = fields.subcategories ? JSON.parse(fields.subcategories) : [];
        const tags = JSON.parse(fields.hashtags || '[]');

        // Article image (optional)
        const articleImage = files.find(f => f.fieldname === 'image');
        // Parse sections



        const subCategories = await Subcategory.findAll({
            where: { id: subcategories }
        });

        if (subCategories.length !== subcategories.length) {
            return res.status(400).json({ error: 'Some subcategories do not exist' });
        }

        const sections = [];

        for (let index = 0; index < JSON.parse(fields["sections"]).length; index++) {

            const order = parseInt(JSON.parse(fields["sections"])[index]["order"], 10);
            let contents = JSON.parse(fields["sections"])[index]["contents"] || [];

            for (let contentIndex = 0; contentIndex < contents.length; contentIndex++) {

                contents[contentIndex].content = JSON.parse(contents[contentIndex].content || '{}');

                if (contents[contentIndex].type === 'carousel') {
                    const media = files.filter(f => f.fieldname === `section${index}-content${contentIndex}-carrousel-image`).map(m => m.path);
                    const captions = JSON.parse(fields[`section${index}-content${contentIndex}-captions`] || '[]');
                    contents[contentIndex].content = { media, captions };

                } else if (contents[contentIndex].type === 'image') {
                    const mediaFile = files.find(f => f.fieldname === `section${index}-content${contentIndex}-image`);
                    if (mediaFile) {
                        contents[contentIndex].content.image = mediaFile.path;
                    } else {
                        contents[contentIndex].content.image = null;
                    }
                } else if (contents[contentIndex].type === 'video') {
                    const mediaFile = files.find(f => f.fieldname === `section${index}-content${contentIndex}-video`);
                    if (mediaFile) {
                        contents[contentIndex].content.video = mediaFile.path;
                    } else {
                        contents[contentIndex].content.video = null;
                    }
                }
            }
            sections.push({ order, contents });
        }


        const article = await Article.create({
            title,
            userId: req.userData.userId,
            slug: title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), // Simple slug generation
            image: articleImage ? articleImage.path : null,
            excerpt,
            status,
            read_duration,
            published_at,
        });

        await article.addSubcategories(subCategories);

        let hashtags = [];

        for (const tag of tags) {
            const [hashtag] = await Hashtag.findOrCreate({
                where: { name: tag },
            });
            hashtags.push(hashtag);
        }

        await article.addHashtags(hashtags);



        if (sections && Array.isArray(sections)) {
            for (const section of sections) {
                const newSection = await Section.create({
                    articleId: article.id,
                    order: section.order,
                });

                if (section.contents && Array.isArray(section.contents)) {
                    for (const content of section.contents) {
                        if (content.type === 'carousel') {
                            const media = content.content.media || [];
                            const captions = content.content.captions || [];
                            let mediaContent = [];
                            for (let i = 0; i < media.length; i++) {
                                mediaContent.push({
                                    image: media[i],
                                    caption: captions[i] || ''
                                });
                            }
                            content.content = mediaContent;
                        }
                        await SectionContent.create({
                            sectionId: newSection.id,
                            type: content.type,
                            content: JSON.stringify(content.content)
                        });

                    }
                }
            }
        }


        // After saving article in DB
        //pingSearchEngines('https://www.dramaspots.com/sitemap.xml');
        // You could now save to DB, validate, etc.
        res.status(200).json({ message: 'Article created successfully', href: `/articles/${article.id}` });

    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Get all articles with sections and section contents
exports.getArticles = async (req, res) => {
    try {
        const articles = await Article.findAll({
            include: [
                {
                    model: Subcategory,
                    as: 'subcategories',
                    attributes: ['id', 'name'],
                    include: [

                        {
                            model: Category,
                            as: 'category',
                            attributes: ['id', 'name'],
                        }
                    ],
                    where: {
                        id: [223, 98, 118]
                    },
                    through: { attributes: [] } // hide junction table fields
                },

                {
                    model: Hashtag,
                    as: 'hashtags',
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                    where: {
                        id: [],
                    },
                },
            ],
            distinct: true // avoid duplicates due to joins
        });

        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single article by ID with sections and section contents
exports.getArticleBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const userId = await req.userData?.userId
        const { article, categories, mostViewed, recommended, related } = await clases.GetArticle.getArticle(slug, userId);
        req.data = { article, categories, mostViewed, recommended, related }; // Store the article in the request object for later use
        req.userId = userId;
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        if (userId) {
            const [interaction, created] = await UserInteraction.findOrCreate({
                where: {
                    user_id: req.userId,
                    article_id: article.id,
                    interaction_type: 'view',
                },
            });
        }
        next();

        //next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getArticleByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const article = await Article.findAll({
            where: { categoryId },
            include: [
                {
                    model: User, as: 'author', attributes: ['id', 'username', 'email'],
                },
                {
                    model: Section, as: 'sections',
                    include: [
                        {
                            model: SectionContent, as: 'contents',
                        }
                    ]
                },
            ]
        });
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an article and its sections/contents
exports.updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            hashtags,
            published_at,
            read_duration,
            categoryId,
            excerpt,
            status,
            sections // [{ id, order, contents: [{ id, type, content }] }]
        } = req.body;

        const article = await Article.findByPk(id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        await article.update({
            title,
            hashtags,
            published_at,
            read_duration,
            categoryId,
            excerpt,
            status
        });

        if (sections && Array.isArray(sections)) {
            for (const section of sections) {
                let sectionInstance;
                if (section.id) {
                    sectionInstance = await Section.findByPk(section.id);
                    if (sectionInstance) {
                        await sectionInstance.update({ order: section.order });
                    }
                } else {
                    sectionInstance = await Section.create({
                        articleId: article.id,
                        order: section.order
                    });
                }

                if (section.contents && Array.isArray(section.contents)) {
                    for (const content of section.contents) {
                        if (content.id) {
                            const contentInstance = await SectionContent.findByPk(content.id);
                            if (contentInstance) {
                                await contentInstance.update({
                                    type: content.type,
                                    content: content.content
                                });
                            }
                        } else {
                            await SectionContent.create({
                                sectionId: sectionInstance.id,
                                type: content.type,
                                content: content.content
                            });
                        }
                    }
                }
            }
        }

        res.json({ message: 'Article updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an article and its sections/contents
exports.deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findByPk(id, {
            include: [{
                model: Section,
                include: [SectionContent]
            }]
        });
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        for (const section of article.Sections) {
            await SectionContent.destroy({ where: { sectionId: section.id } });
        }
        await Section.destroy({ where: { articleId: article.id } });
        await article.destroy();

        res.json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
