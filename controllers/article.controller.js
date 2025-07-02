const { Article, Section, SectionContent, User, Hashtag, Category, Subcategory, UserInteraction, Activity } = require('../models');
const clases = require('../classes');
const { Op, where, or } = require('sequelize');
const { deleteFromCloudinary } = require('../middlewares/cloudinary');

// /controllers/article.controller.js


// Create a new article with sections and section contents
const fs = require('fs');
const path = require('path');
const e = require('express');
const https = require('https');

async function notifyIndexNow(url) {
    return new Promise((resolve) => {
        const key = '8eb0e434093a8ded9ae0abdfa036baca';
        const postData = JSON.stringify({
            host: 'dramaspots.com',
            key: key,
            urlList: [url]
        });

        const req = https.request({
            hostname: 'api.indexnow.org',
            path: '/indexnow',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, res => {
            console.log(`IndexNow Response: ${res.statusCode}`);
            resolve(); // ✅ Resolve regardless of status
        });

        req.on('error', err => {
            console.error(`IndexNow Error: ${err.message}`);
            resolve(); // ✅ Resolve even on error
        });

        req.write(postData);
        req.end();
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


        const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const article = await Article.create({
            title,
            userId: req.userData.userId,
            slug,
            image: articleImage ? articleImage.path : null,
            excerpt,
            status,
            read_duration,
            published_at,
        });

        if (status === 'published') {
            await notifyIndexNow(`https://dramaspots.com/article/${slug}`);
        }

        await Activity.create({
            type: 'publish',
            user_id: req.userData.userId,
            message: `published a new article`,
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


exports.createArticle = async (req, res) => {
    try {
        const fields = req.body;
        const files = req.files;

        const title = fields.title;
        const excerpt = fields.excerpt;
        const status = fields.status;
        const read_duration = parseInt(fields.read_duration, 10) || 0;
        const published_at = fields.published_at !== '' ? fields.published_at : null;
        const subcategories = fields.subcategories ? JSON.parse(fields.subcategories) : [];
        const tags = JSON.parse(fields.hashtags || '[]');
        const articleImage = files.find(f => f.fieldname === 'image');

        const subCategories = await Subcategory.findAll({
            where: { id: subcategories }
        });
        if (subCategories.length !== subcategories.length) {
            return res.status(400).json({ error: 'Some subcategories do not exist' });
        }

        const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const article = await Article.create({
            title,
            userId: req.userData.userId,
            slug,
            image: articleImage ? articleImage.path : null,
            excerpt,
            status,
            read_duration,
            published_at,
        });

        if (status === 'published') {
            await notifyIndexNow(`https://dramaspots.com/article/${slug}`);
        }

        await Activity.create({
            type: 'publish',
            user_id: req.userData.userId,
            message: `published a new article`,
        });
        await article.addSubcategories(subCategories);

        const hashtags = [];
        for (const tag of tags) {
            const [hashtag] = await Hashtag.findOrCreate({ where: { name: tag } });
            hashtags.push(hashtag);
        }
        await article.addHashtags(hashtags);

        //pingSearchEngines('https://www.dramaspots.com/sitemap.xml');
        res.status(200).json({ message: 'Article created successfully', id: article.id });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.createSections = async (req, res) => {
    const { order, articleId } = req.body;

    try {
        // Check if the article exists
        const article = await Article.findByPk(articleId);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Create the new section
        const newSection = await Section.create({
            articleId,
            order,
        });

        res.status(201).json({ id: newSection.id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while creating section' });
    }
};


exports.createSectionContentsxx = async (req, res) => {
    const { content, type } = req.body;
    const { sectionId } = req.params;

    content[type] = null;
    const newContent = await SectionContent.create({
        sectionId,
        type,
        content: JSON.stringify(content)
    });
    const data = JSON.parse(JSON.stringify(content));
    data.id = newContent.id;

    res.json({
        "content": data
    });
};


exports.createSectionContents = async (req, res) => {
    let { content, type } = req.body;
    const { sectionId } = req.params;
    const files = req.files;
    content = JSON.parse(content);

    if (type === 'carousel') {
        const media = files
            .filter(f => f.fieldname === `carousel_media`)
            .map(m => m.path);
        const captions = content.captions;

        const mediaContent = media.map((image, i) => ({
            image,
            caption: captions[i] || ''
        }));

        content = mediaContent;

    } else if (type === 'image') {
        const mediaFile = files.find(f => f.fieldname === `image`);
        content.image = mediaFile ? mediaFile.path : null;

    } else if (type === 'video') {
        const mediaFile = files.find(f => f.fieldname === `video`);
        content.video = mediaFile ? mediaFile.path : null;
    }

    await SectionContent.create({
        sectionId,
        type: type,
        content: JSON.stringify(content)
    });
    res.json({ success: true });
};


// Get a single article by ID with sections and section contents
exports.getArticleBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const userId = await req.userData?.userId
        const { article, categories, mostViewed, recommended, related } = await clases.GetArticle.getArticle(slug, userId);
        req.data = { article, categories, mostViewed, recommended, related }; // Store the article in the request object for later use
        req.userId = userId;
        req.path = `/article/${article.slug}`
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        await UserInteraction.create({
            user_id: req.userId || 4,
            article_id: article.id,
            interaction_type: 'view',
        });

        if (req.headers['content-type'] === 'application/json') {
            return res.json(article);
        } else {
            next();
        }

        //next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findByPk(id, {
            include: [{
                model: Subcategory,
                as: 'subcategories',
                attributes: ['id', 'name'],
                include: {
                    model: Category,
                    as: 'category'
                },
                through: { attributes: [] }
            },
            {
                model: Hashtag,
                as: 'hashtags',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            },
            {
                model: Section,
                as: 'sections',
                attributes: ['id', 'order', 'articleId'],
            }
            ],
            order: [
                ['sections', 'order', 'ASC'],
            ]

        });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }


        res.status(200).json({
            ...article.toJSON(),
        });

    } catch (error) {
        console.error('Error fetching article by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.shareBySlug = async (req, res) => {
    try {
        const { id } = req.body;


        const article = await Article.findByPk(parseInt(id));

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        await UserInteraction.create({
            user_id: req.userData?.userId || 4,
            article_id: article.id,
            interaction_type: 'share',
        });


        res.status(200).json({ message: 'Done' });
    } catch (error) {
        console.error('Error sharing article by slug:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getSectionById = async (req, res) => {
    try {
        const { id } = req.params;

        const section = await Section.findByPk(id, {
            include: [
                {
                    model: SectionContent,
                    as: 'contents'
                },
                {
                    model: Article,
                    as: 'article',
                    attributes: ['id', 'title', 'slug']
                }
            ],
            order: [['contents', 'id', 'ASC']]
        });

        if (!section) {
            return res.status(404).json({ error: 'Section not found' });
        }

        // Optional: parse content JSON for each SectionContent
        const parsedContents = section.contents.map(content => ({
            content: parseJSONSafe(content.content, content.id, content.type)
        }));

        res.status(200).json({
            ...section.toJSON(),
            SectionContents: parsedContents
        });

    } catch (error) {
        console.error('Error fetching section by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

function parseJSONSafe(str, id, type) {
    try {
        if (type === "carousel") {
            const content = JSON.parse(str);
            if (content && Array.isArray(content)) {
                const data = JSON.parse(JSON.stringify({
                    carousel: [],
                    images: content.map(c => c.image),
                    captions: content.map(c => c.caption),
                }));
                data.id = id;
                return data;
            }

        } else if (type === "list") {
            const data = JSON.parse(str);
            data.list = [];
            data.id = id;
            return data;

        } else if (type === "embed") {
            const data = JSON.parse(str);
            data.embed = '';
            data.id = id;
            return data;

        } else {
            const data = JSON.parse(str);
            data.id = id;
            return data;

        }
    } catch {
        return str;
    }
}

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
        const fields = req.body;
        const files = req.files || [];

        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ error: 'Article not found' });

        const updatedFields = {};
        if (fields.title !== undefined && fields.title !== null) updatedFields.title = fields.title;
        if (fields.excerpt !== undefined && fields.excerpt !== null) updatedFields.excerpt = fields.excerpt;
        if (fields.status !== undefined && fields.status !== null) updatedFields.status = fields.status;
        if (fields.read_duration !== undefined && fields.read_duration !== null) updatedFields.read_duration = parseInt(fields.read_duration, 10);
        if (fields.published_at !== undefined && fields.published_at !== null) updatedFields.published_at = fields.published_at;

        if (fields.title) {
            updatedFields.slug = fields.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }

        // Handle image update and delete old image from Cloudinary if replaced
        const newImageFile = files.find(f => f.fieldname === 'image');
        if (newImageFile) {
            if (article.image && article.image !== newImageFile.path) {
                await deleteFromCloudinary(article.image);
            }
            updatedFields.image = newImageFile.path;
        }

        await article.update(updatedFields);

        // Update subcategories
        if (fields.subcategories) {
            const subcategories = JSON.parse(fields.subcategories);
            const subCats = await Subcategory.findAll({ where: { id: subcategories } });
            await article.setSubcategories(subCats);
        }

        // Update hashtags
        if (fields.hashtags) {
            const tags = JSON.parse(fields.hashtags);
            const hashtags = [];
            for (const tag of tags) {
                const [hashtag] = await Hashtag.findOrCreate({ where: { name: tag } });
                hashtags.push(hashtag);
            }
            await article.setHashtags(hashtags);
        }

        res.status(200).json({ message: 'Article updated successfully' });
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.publishArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findByPk(id);
        if (!article) return res.status(404).json({ error: 'Article not found' });

        const updatedFields = {};
        updatedFields.status = 'published';

        await article.update(updatedFields);

        await notifyIndexNow(`https://dramaspots.com/article/${article.slug}`);

        res.status(200).json({ message: 'Article published successfully' });
    } catch (error) {
        console.error('Error publishing article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.updateSection = async (req, res) => {
    try {
        const { sections } = req.body;

        if (sections.length) {
            sections.forEach(async (sec) => {
                const section = await Section.findByPk(sec.id);
                if (!section) return res.status(404).json({ error: 'Section not found' });
                const order = sec.order;
                if (order !== undefined) {
                    section.order = parseInt(order, 10);
                    await section.save();
                }
            })
        }

        res.status(200).json({ message: 'Section updated successfully' });
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateSectionContent = async (req, res) => {
    try {
        const id = req.params.contentId;
        let { type, content, carousel_links = [] } = req.body;
        const files = req.files || [];

        content = JSON.parse(content);
        const sectionContent = await SectionContent.findByPk(id);
        if (!sectionContent) return res.status(404).json({ error: 'Section content not found' });

        // Parse old content for media deletion
        let oldContent;
        try {
            oldContent = JSON.parse(sectionContent.content);
        } catch {
            oldContent = null;
        }

        if (sectionContent.type === 'carousel') {
            const mediaFiles = files
                .filter(f => f.fieldname === 'carousel_media')
                .map(f => f.path);

            const media = [...JSON.parse(carousel_links), ...mediaFiles];
            const captions = content?.captions || [];

            // Delete excluded images from Cloudinary
            if (Array.isArray(oldContent)) {
                const oldImages = oldContent.map(item => item.image);
                const newImages = media;
                for (const oldImage of oldImages) {
                    if (oldImage && !newImages.includes(oldImage)) {
                        await deleteFromCloudinary(oldImage);
                    }
                }
            }

            const mediaContent = media.map((image, i) => ({
                image,
                caption: captions[i] || ''
            }));

            content = mediaContent;

        } else if (sectionContent.type === 'image') {
            const mediaFile = files.find(f => f.fieldname === `image`);
            // Delete old image if replaced
            if (oldContent?.image && mediaFile && oldContent.image !== mediaFile.path) {
                await deleteFromCloudinary(oldContent.image);
            }
            content.image = mediaFile ? mediaFile.path : oldContent?.image || null;

        } else if (sectionContent.type === 'video') {
            const mediaFile = files.find(f => f.fieldname === `video`);
            // Delete old video if replaced
            if (oldContent?.video && mediaFile && oldContent.video !== mediaFile.path) {
                await deleteFromCloudinary(oldContent.image);
            }
            content.video = mediaFile ? mediaFile.path : oldContent?.video || null;
        }

        if (type) sectionContent.type = type;
        if (content) sectionContent.content = JSON.stringify(content);

        await sectionContent.save();

        res.status(200).json({ message: 'Section content updated successfully' });
    } catch (error) {
        console.error('Error updating section content:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        const article = await Article.findByPk(id, {
            include: [
                {
                    model: Section,
                    as: 'sections',
                    include: [
                        { model: SectionContent, as: 'contents' }
                    ]
                }
            ]
        });
        if (!article) return res.status(404).json({ error: 'Article not found' });

        // Delete article image from Cloudinary if present
        if (article.image) {
            await deleteFromCloudinary(article.image);
        }

        // Delete related sections and contents, including media from Cloudinary
        for (const section of article.sections) {
            for (const content of section.contents) {
                let parsedContent;
                try {
                    parsedContent = JSON.parse(content.content);
                } catch {
                    parsedContent = null;
                }

                if (content.type === 'carousel' && Array.isArray(parsedContent)) {
                    for (const item of parsedContent) {
                        if (item.image) {
                            await deleteFromCloudinary(item.image);
                        }
                    }
                } else if (content.type === 'image' && parsedContent?.image) {
                    await deleteFromCloudinary(parsedContent.image);
                } else if (content.type === 'video' && parsedContent?.video) {
                    await deleteFromCloudinary(parsedContent.video);
                }
                await content.destroy();
            }
            await section.destroy();
        }

        await article.destroy();



        const [activity, created] = await Activity.findOrCreate({
            where: {
                type: 'delete',
                user_id: article.userId,
            },
            defaults: {
                message: `deleted`,
            },
        });

        res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.deleteSection = async (req, res) => {
    try {
        const { id } = req.params;

        const section = await Section.findByPk(id, {
            include: [{ model: SectionContent, as: 'contents' }]
        });
        if (!section) return res.status(404).json({ error: 'Section not found' });

        // Delete media from Cloudinary for each SectionContent
        for (const content of section.contents) {
            let parsedContent;
            try {
                parsedContent = JSON.parse(content.content);
            } catch {
                parsedContent = null;
            }

            if (content.type === 'carousel' && Array.isArray(parsedContent)) {
                for (const item of parsedContent) {
                    if (item.image) {
                        await deleteFromCloudinary(item.image);
                    }
                }
            } else if (content.type === 'image' && parsedContent?.image) {
                await deleteFromCloudinary(parsedContent.image);
            } else if (content.type === 'video' && parsedContent?.video) {
                await deleteFromCloudinary(parsedContent.video);
            }
            await content.destroy();
        }

        await section.destroy();

        res.status(200).json({ message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteSectionContent = async (req, res) => {
    try {
        const { id } = req.params;

        const content = await SectionContent.findByPk(id);
        if (!content) return res.status(404).json({ error: 'Content not found' });

        // Delete media from Cloudinary if present
        let parsedContent;
        try {
            parsedContent = JSON.parse(content.content);
        } catch {
            parsedContent = null;
        }

        if (content.type === 'carousel' && Array.isArray(parsedContent)) {
            for (const item of parsedContent) {
                if (item.image) {
                    await deleteFromCloudinary(item.image);
                }
            }
        } else if (content.type === 'image' && parsedContent?.image) {
            await deleteFromCloudinary(parsedContent.image);
        } else if (content.type === 'video' && parsedContent?.video) {
            await deleteFromCloudinary(parsedContent.video);
        }

        await content.destroy();

        res.status(200).json({ message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
