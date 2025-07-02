const { Article, UserInteraction, Subcategory, Category, Hashtag, Comment, User } = require('../models');
const { Op, Sequelize, fn, col, where } = require('sequelize');

exports.logInteraction = async (req, res) => {
  try {
    const {
      user_id,        // optional
      article_id,
      interaction_type, // 'view', 'like', 'share', 'comment', etc.
      device,          // optional
      ip_address       // optional
    } = req.body;

    if (!article_id || !interaction_type) {
      return res.status(400).json({ message: 'article_id and interaction_type are required.' });
    }

    const interaction = await UserInteraction.create({
      user_id,
      article_id,
      interaction_type,
      device,
      ip_address,
    });

    res.status(201).json({ message: 'Interaction logged successfully.', data: interaction });
  } catch (error) {
    console.error('Error logging interaction:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.getInteractions = async (req, res) => {
  try {
    const { article_id } = req.query;

    if (!article_id) {
      return res.status(400).json({ message: 'article_id is required.' });
    }

    const interactions = await UserInteraction.findAll({
      where: { article_id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ data: interactions });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Additional methods can be added here for more complex queries or aggregations
// For example, to get interactions by user or to count interactions by type

// controllers/userInteractionController.js

exports.getTrendingArticles = async (req, res) => {
  try {
    const interactions = await UserInteraction.findAll({
      attributes: [
        'article_id',
        [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'view_count'],
      ],
      where: {
        interaction_type: 'view',
        createdAt: {
          [Op.gte]: Sequelize.literal('NOW() - INTERVAL 1 DAY')
        }
      },
      group: ['article_id'],
      order: [[Sequelize.literal('view_count'), 'DESC']],
      limit: 10,
      raw: true
    });

    const articleIds = interactions.map(i => i.article_id);

    const articles = await Article.findAll({
      where: { id: articleIds },
      attributes: ['id', 'title', 'slug', 'image', 'published_at', 'excerpt'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_pic'],
        },
        {
          model: Hashtag,
          as: 'hashtags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
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
          through: { attributes: [] },
        },
      ],
    });

    res.json({ trending: articles });
  } catch (error) {
    console.error('Error fetching trending articles:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// controllers/userInteractionController.js

exports.getMostLikedArticles = async (req, res) => {
  try {
    const interactions = await UserInteraction.findAll({
      attributes: [
        'article_id',
        [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'like_count'],
      ],
      where: {
        interaction_type: 'like',
      },
      group: ['article_id'],
      order: [[Sequelize.literal('like_count'), 'DESC']],
      limit: 10,
      raw: true,
    });

    const articleIds = interactions.map(i => i.article_id);

    const articles = await Article.findAll({
      where: { id: articleIds }
    });

    res.json({ mostLiked: articles });
  } catch (error) {
    console.error('Error fetching most liked articles:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.getRecommendedArticles = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) return res.status(400).json({ message: "Missing user_id" });

  try {
    // Step 1: Top 3 categories based on user’s views
    const viewed = await UserInteraction.findAll({
      attributes: [
        'article_id',
        [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'views']
      ],
      where: {
        user_id,
        interaction_type: 'view',
      },
      group: ['article_id'],
      order: [[Sequelize.literal('views'), 'DESC']],
      limit: 20,
      raw: true
    });

    const viewedIds = viewed.map(v => v.article_id);

    const viewedArticles = await Article.findAll({
      where: { id: viewedIds },
      include: [

        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name'],
          through: { attributes: [] }, // hide junction table fields
          include: [

            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name'],
            }
          ]
        }
      ]
    });

    let categories = [];
    const categoryCount = {};
    viewedArticles.forEach(a => {
      a.subcategories.forEach(s => {
        categories.push(s.category);
        categoryCount[s.id] = (categoryCount[s.id] || 0) + 1;
      })
    });

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    const recommended = await Article.findAll({
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
            id: topCategories
          },
          through: { attributes: [] } // hide junction table fields
        },
      ],
      where: {
        id: { [Op.notIn]: viewedIds } // exclude already viewed
      },
      order: [['published_at', 'DESC']],
      limit: 10,
      distinct: true // avoid duplicates due to joins
    });

    res.json({ recommended });
  } catch (err) {
    console.error('Error recommending articles:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getUserHistory = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) return res.status(400).json({ message: 'Missing user_id' });

  try {
    const views = await UserInteraction.findAll({
      where: {
        user_id,
        interaction_type: 'view',
      },
      attributes: ['article_id', 'timestamp'],
      order: [['timestamp', 'DESC']],
      limit: 20,
      raw: true
    });

    const articleIds = views.map(v => v.article_id);

    const articles = await Article.findAll({
      where: { id: articleIds },
      order: [['published_at', 'DESC']]
    });

    res.json({ history: articles });
  } catch (err) {
    console.error('Error getting user history:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getArticleAnalytics = async (req, res) => {
  const { article_id } = req.params;

  if (!article_id) return res.status(400).json({ message: 'Missing article_id' });

  try {
    const [views, likes, shares, comments] = await Promise.all([
      UserInteraction.count({
        where: {
          article_id,
          interaction_type: 'view'
        }
      }),
      UserInteraction.count({
        where: {
          article_id,
          interaction_type: 'like'
        }
      }),
      UserInteraction.count({
        where: {
          article_id,
          interaction_type: 'share'
        }
      }),
      UserInteraction.count({
        where: {
          article_id,
          interaction_type: 'comment'
        }
      }),
    ]);

    res.json({
      article_id,
      views,
      likes,
      shares,
      comments
    });
  } catch (err) {
    console.error('Error getting article analytics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getSimilarArticlesForUser = async (req, res) => {
  const { article_id, user_id } = req.params;

  if (!article_id || !user_id) {
    return res.status(400).json({ message: 'Missing article_id or user_id' });
  }

  try {
    // Step 1: Fetch current article's category and hashtags
    const currentArticle = await Article.findByPk(article_id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name'],
          through: { attributes: [] }, // hide junction table fields
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name'],
            }
          ]
        },
        {
          model: Hashtag,
          as: 'hashtags',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!currentArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Step 2: Get article IDs the user already viewed
    const viewed = await UserInteraction.findAll({
      where: {
        user_id,
        interaction_type: 'view',
      },
      attributes: ['article_id'],
      raw: true
    });


    const viewedIds = viewed.map(v => v.article_id);

    const viewedArticles = await Article.findAll({
      where: {
        id: viewedIds.length ? { [Op.in]: viewedIds } : -1
      },
      include: [
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name'],
          through: { attributes: [] }, // hide junction table fields
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name'],
            }
          ]
        },
        {
          model: Hashtag,
          as: 'hashtags',
          attributes: ['id', 'name'],
        },
      ],
      raw: true,
    });

    const categoryCount = {};
    let categories = [];
    const tagCount = {};

    currentArticle.subcategories.forEach(s => {
      categories.push(s.category);
      categoryCount[s.id] = (categoryCount[s.id] || 0) + 1;
    })

    currentArticle.hashtags.forEach(h => {
      tagCount[h.id] = (tagCount[h.id] || 0) + 1;
    })

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    const HashtagArticles = await Article.findAll({
      include: [
        {
          model: Hashtag,
          as: 'hashtags',
          attributes: ['id'],
          where: {
            id: topTags
          },
          through: { attributes: [] }
        },
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
          through: { attributes: [] },
        },
      ],
      where: {
        id: { [Op.notIn]: [article_id, ...viewedIds] } // exclude already viewed
      },
      order: [['published_at', 'DESC']],
      limit: 10,
      distinct: true // avoid duplicates due to joins
    });


    const hashtagArticleIds = HashtagArticles.map(a => a.id);
    // 3. Most viewed articles

    const interactions = await UserInteraction.findAll({
      attributes: [
        'article_id',
        [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'view_count'],
      ],
      where: {
        interaction_type: 'view',
        createdAt: {
          [Op.gte]: Sequelize.literal('NOW() - INTERVAL 31 DAY')
        }
      },
      group: ['article_id'],
      order: [[Sequelize.literal('view_count'), 'DESC']],
      limit: 10,
      raw: true
    });
    const articleIds = interactions.map(i => i.article_id);

    const mostViewed = await Article.findAll({
      where: { id: articleIds },
      attributes: ['id', 'title', 'slug', 'image', 'published_at']
    });


    const categoryArticles = await Article.findAll({
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
            id: topCategories
          },
          through: { attributes: [] },
        },
      ],
      where: {
        id: { [Op.notIn]: [article_id, ...viewedIds, ...hashtagArticleIds] } // exclude already viewed
      },
      order: [['published_at', 'DESC']],
      limit: 10,
      distinct: true // avoid duplicates due to joins
    });


    res.json({ categories: categories, mostViewed, recommended: [...HashtagArticles, ...categoryArticles].slice(0, 10) });

  } catch (err) {
    console.error('Error recommending similar articles:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getPersonalizedRecommendations = async (req, res) => {
  const { user_id, current_article_id } = req.params;

  if (!user_id || !current_article_id) {
    return res.status(400).json({ message: "Missing user_id or current_article_id" });
  }

  try {
    // Step 1: Get the current article and its hashtags
    const currentArticle = await Article.findByPk(current_article_id);

    if (!currentArticle) {
      return res.status(404).json({ message: 'Current article not found' });
    }

    const hashtags = Array.isArray(currentArticle.hashtags) ? currentArticle.hashtags : [];

    // Build OR conditions with LIKE for hashtags
    const tagConditions = hashtags.length
      ? hashtags.map(tag => ({
        hashtags: {
          [Op.like]: `%${tag}%`
        }
      }))
      : [];

    // Step 2: Get user's top viewed articles
    const viewed = await UserInteraction.findAll({
      where: {
        user_id,
        interaction_type: 'view',
      },
      attributes: [
        'article_id',
        [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'views']
      ],
      group: ['article_id'],
      raw: true,
      limit: 30,
    });

    const viewedArticleIds = viewed.map(v => v.article_id);

    const viewedArticles = await Article.findAll({
      where: {
        id: viewedArticleIds.length ? { [Op.in]: viewedArticleIds } : -1
      },
      attributes: ['id', 'category_id'],
      raw: true,
    });

    // Count frequency of categories
    const categoryCount = {};
    viewedArticles.forEach(article => {
      categoryCount[article.category_id] = (categoryCount[article.category_id] || 0) + 1;
    });

    // Give extra weight to the current article's category
    categoryCount[currentArticle.category_id] = (categoryCount[currentArticle.category_id] || 0) + 5;

    // Sort categories by frequency and take top 5
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    // Step 3: Get articles matching hashtags (excluding viewed/current)
    const hashtagsArticles = tagConditions.length
      ? await Article.findAll({
        where: {
          id: {
            [Op.notIn]: [...viewedArticleIds, Number(current_article_id)]
          },
          [Op.or]: tagConditions
        },
        order: [['published_at', 'DESC']],
        limit: 10
      })
      : [];

    const hashtagArticleIds = hashtagsArticles.map(a => a.id);

    // Step 4: Get recommended articles from top categories
    const recommendations = await Article.findAll({
      where: {
        category_id: {
          [Op.in]: topCategories
        },
        id: {
          [Op.notIn]: [...viewedArticleIds, Number(current_article_id), ...hashtagArticleIds]
        }
      },
      order: [['published_at', 'DESC']],
      limit: 10
    });

    return res.json({ recommended: [...hashtagsArticles, ...recommendations] });

  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




exports.getTagBasedRecommendations = async (req, res) => {
  const { article_id } = req.params;

  try {
    const article = await Article.findByPk(article_id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const hashtags = article.hashtags || [];
    if (!Array.isArray(hashtags) || hashtags.length === 0) {
      return res.json({ recommended: [] });
    }

    // Build OR conditions with LIKE
    const tagConditions = hashtags.map(tag => ({
      hashtags: {
        [Op.like]: `%${tag}%`
      }
    }));

    const recommended = await Article.findAll({
      where: {
        id: { [Op.ne]: article_id },
        [Op.or]: tagConditions
      },
      limit: 10,
      order: [['published_at', 'DESC']]
    });

    res.json({ recommended });
  } catch (err) {
    console.error('Error in tag-based recommendation:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getLatestArticlesPage = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const articles = await Article.findAll({
      order: [['published_at', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'title', 'slug', 'image', 'published_at', 'excerpt'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_pic']
        },
        {
          model: Hashtag,
          as: 'hashtags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ],
          through: { attributes: [] }
        }
      ]
    });

    res.json(articles);

  } catch (error) {
    console.error('Error fetching latest articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getHomePageContent = async (req, res, next) => {

  const user_id = await req.userData?.userId;
  try {

    const totalArticles = await Article.count({
      where: { status: 'published' }
    });;
    if (totalArticles === 0) {
      req.data = {
        featured: [],
        latest: [],
        mostViewed: [],
        mostCommented: [],
        hashtags: [],
        categories: [],
        personalized: []
      };
      return next();
    }

    // 1. Featured articles
    const featured = await Article.findAll({
      where: { featured: true },
      limit: 3,
      attributes: ['id', 'title', 'slug', 'image', 'published_at', 'excerpt'],
      order: [['published_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_pic'],
        },
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
          through: { attributes: [] },
        },
      ],
    });

    // 2. Latest articles
    const latest = await Article.findAll({
      where: {
        status: 'published',
        id: { [Op.notIn]: featured.map(f => f.id) }
      },
      order: [['published_at', 'DESC']],
      attributes: ['id', 'title', 'slug', 'image', 'published_at', 'excerpt'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_pic'],
        },
        {
          model: Hashtag,
          as: 'hashtags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
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
          through: { attributes: [] },
        },
      ],
      limit: 10
    });

    // 3. Most viewed articles
    const interactions = await UserInteraction.findAll({
      attributes: [
        'article_id',
        [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'view_count'],
      ],
      where: {
        interaction_type: 'view',
        createdAt: {
          [Op.gte]: Sequelize.literal('NOW() - INTERVAL 1 DAY')
        }
      },
      group: ['article_id'],
      order: [[Sequelize.literal('view_count'), 'DESC']],
      limit: 10,
      raw: true
    });

    const comments = await Comment.findAll({
      attributes: [
        'article_id',
        [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'comment_count']
      ],
      where: {
        createdAt: {
          [Op.gte]: Sequelize.literal('NOW() - INTERVAL 10 DAY')
        }
      },
      group: ['article_id'],
      order: [[Sequelize.literal('comment_count'), 'DESC']],
      limit: 10
    });


    const articleIds = interactions.map(i => i.article_id);

    const mostViewed = await Article.findAll({
where: {
  [Op.and]: [
    { id: articleIds },
    {
      id: {
        [Op.notIn]: [
          ...featured.map(f => f.id),
          ...latest.map(f => f.id),
        ]
      }
    },
    { status: 'published' }
  ]
},
      attributes: ['id', 'title', 'slug', 'image', 'published_at']
    });

    const hashtags = await Hashtag.findAll({
      limit: 6,
      attributes: ['id', 'name']
    });

    const commentsId = comments.map(i => i.article_id);

    // 4. Most commented articles
    const mostCommented = await Article.findAll({
      where: { id: articleIds }
    });

    // 5. Category Highlights
    // Only fetch categories that have at least one article in any of their subcategories
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
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
      limit: 6,
      distinct: true
    });

    const categoriesAll = await Category.findAll({
      attributes: ['id', 'name'],
      include: [{
        model: Subcategory,
        as: 'subcategories',
        required: true,
        include: [{
          model: Article,
          as: 'articles',
          where: {
            id: { [Op.notIn]: [...featured.map(f => f.id), ...latest.map(f => f.id), ...mostViewed.map(f => f.id)] }
          },
          required: true,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'profile_pic'],
            },
          ],
          attributes: ['id', 'title', 'slug', 'image', 'published_at']
        }]
      }],
      distinct: true
    });



    const categoriesWithLimitedArticles = categoriesAll.map(cat => {
      // Gather all articles from all subcategories
      const allArticles = (cat.subcategories || [])
        .flatMap(sub => sub.articles || []);
      // Sort by published_at descending and take up to 10
      const allTheArticles = allArticles
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

      let uniqueArt = {};

      for (var art of allTheArticles) {
        if (!uniqueArt[art.id]) uniqueArt[art.id] = art;
      }

      const limitedArticles = Object.values(uniqueArt).slice(0, 10);
      return {
        name: cat.name,
        id: cat.id,
        articles: limitedArticles
      };
    });

    // 6. Personalized Recommendations
    let personalized = [];
    if (user_id) {
      // Step 1: Find user's viewed articles
      const viewed = await UserInteraction.findAll({
        attributes: [
          'article_id',
          [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'views']
        ],
        where: {
          user_id,
          interaction_type: 'view',
        },
        group: ['article_id'],
        order: [[Sequelize.literal('views'), 'DESC']],
        limit: 20,
        raw: true
      });

      const viewedIds = viewed.map(v => v.article_id);

      const viewedArticles = await Article.findAll({
        where: { id: viewedIds },
        include: [{
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name'],
          }]
        }]
      });

      const categoryCount = {};
      viewedArticles.forEach(a => {
        a.subcategories.forEach(s => {
          if (s.category) {
            const catId = s.category.id;
            categoryCount[catId] = (categoryCount[catId] || 0) + 1;
          }
        });
      });

      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => parseInt(entry[0]));

      personalized = await Article.findAll({
        attributes: ['id', 'title', 'slug', 'image', 'published_at'],
        include: [{
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id'],
          through: { attributes: [] },
        }],
        where: {
          status: 'published',
          id: { [Op.notIn]: [...featured.map(f => f.id), ...latest.map(f => f.id), ...viewedIds, ...mostViewed.map(f => f.id)] }
        },
        order: [['published_at', 'DESC']],
        limit: 10,
        distinct: true
      });
    }


    req.path = '/'
    req.data = {
      featured,
      latest,
      mostViewed,
      hashtags,
      categories,
      allCategories: categoriesWithLimitedArticles,
      personalized
    }
    return next();
    // next();

  } catch (error) {
    console.error('Error loading homepage content:', error);
    res.status(500).json({ message: 'Internal server errorsssssss' });
  }
};


exports.getLatestCategoryArticlesPage = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = 10;
  const offset = (page - 1) * limit;
  const { categoryName } = req.params;

  try {
    // 1. Find the category
    const category = await Category.findOne({
      where: { name: categoryName },
      attributes: ['id', 'name', 'description'],
      include: {
        model: Subcategory,
        as: 'subcategories',
        attributes: ['id'],
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const subcategoryIds = category.subcategories.map(s => s.id);

    const articles = await Article.findAll({
      where: { status: 'published' },
      order: [['published_at', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'title', 'slug', 'image', 'excerpt', 'published_at', 'read_duration'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_pic']
        },
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name'],
          where: { id: subcategoryIds },
          include: {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          through: { attributes: [] }
        },
        {
          model: Hashtag,
          as: 'hashtags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
      ],
    });

    res.json(articles);

  } catch (error) {
    console.error('Error fetching latest articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getLatestTagArticlesPage = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = 10;
  const offset = (page - 1) * limit;
  const hashtagName = req.params.hashtagName || '';
  const query = req.query.query?.toLowerCase() || '';


  try {
    // 1. Find the hashtag
    const hashtag = await Hashtag.findOne({
      where: { name: hashtagName },
      attributes: ['id', 'name'],
    });

    if (!hashtag) {
      return res.status(404).json({ message: 'Hashtag not found' });
    }

    const titleFilter = query && query.trim() !== ''
      ? {
        [Op.and]: [
          where(fn('LOWER', col('title')), {
            [Op.like]: `%${query.toLowerCase()}%`
          })
        ]
      }
      : {}; // No filter if query is empty
    // 2. Fetch latest articles with this hashtag
    const articles = await Article.findAll({
      where: titleFilter,
      order: [['published_at', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'title', 'slug', 'image', 'excerpt', 'published_at'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_pic']
        },
        {
          model: Hashtag,
          as: 'hashtags',
          where: { id: hashtag.id },
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name'],
          include: {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          through: { attributes: [] }
        },
      ],
      order: [['published_at', 'DESC']],
    });

    res.json(articles);

  } catch (error) {
    console.error('Error fetching latest articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getCategoryPageContent = async (req, res, next) => {
  const { categoryName } = req.params;
  const user_id = req.userData?.userId;

  req.path = `/category/${categoryName}`;
  console.log(categoryName);
  try {

    // 1. Find the category
    const category = await Category.findOne({
      where: { name: categoryName },
      attributes: ['id', 'name', 'description'],
      include: {
        model: Subcategory,
        as: 'subcategories',
        attributes: ['id'],
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const totalArticles = await Article.count({
      where: { status: 'published' }
    });
    
    if (totalArticles === 0) {
      req.data = {
        category: category,
        latest: [],
        mostViewed: [],
        hashtags: [],
        relatedCategories: [],
        personalized: []
      };

      return next();
    }
    const subcategoryIds = category.subcategories.map(s => s.id);

    // 2. Fetch latest articles in this category
    const latest = await Article.findAll({
      where: { status: 'published' },
      attributes: ['id', 'title', 'slug', 'image', 'excerpt', 'published_at', 'read_duration'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_pic']
        },
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name'],
          where: { id: subcategoryIds },
          include: {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          through: { attributes: [] }
        },
        {
          model: Hashtag,
          as: 'hashtags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
      ],
      order: [['published_at', 'DESC']],
      limit: 10
    });


    // 3. Most viewed articles in this category
    const interactions = await UserInteraction.findAll({
      attributes: [
        'article_id',
        [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'views']
      ],
      where: {
        interaction_type: 'view',
        createdAt: { [Op.gte]: Sequelize.literal('NOW() - INTERVAL 10 DAY') }
      },
      group: ['article_id'],
      order: [[Sequelize.literal('views'), 'DESC']],
      raw: true
    });

    const topViewedIds = interactions.map(i => i.article_id);

    const mostViewed = await Article.findAll({
      where: {
  [Op.and]: [
    { id: topViewedIds },
    {
      id: {
        [Op.notIn]: [
          ...latest.map(f => f.id),
        ]
      }
    },
    { status: 'published' }
  ]
},
      include: [{
        model: Subcategory,
        as: 'subcategories',
        attributes: ['id'],
        where: { id: subcategoryIds },
        through: { attributes: [] }
      },
      {
        model: Hashtag,
        as: 'hashtags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      },
      ],
      attributes: ['id', 'title', 'slug', 'image', 'published_at'],
      limit: 5
    });

    // 5. Personalized recommendations
    let personalized = [];
    let viewedOnes = [];
    if (user_id) {
      const viewed = await UserInteraction.findAll({
        attributes: ['article_id'],
        where: {
          user_id,
          interaction_type: 'view'
        },
        raw: true
      });

      const viewedIds = viewed.map(v => v.article_id);
      viewedOnes = viewed.map(v => v.article_id);

      personalized = await Article.findAll({
        where: {
          status: 'published',
          id: { [Op.notIn]: [...viewedIds, ...latest.map(f => f.id),
          ...mostViewed.map(f => f.id)] }
        },
        include: [
          {
            model: Hashtag,
            as: 'hashtags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          },
          {
            model: Subcategory,
            as: 'subcategories',
            attributes: ['id'],
            where: { id: subcategoryIds },
            through: { attributes: [] }
          }],
        attributes: ['id', 'title', 'slug', 'image', 'published_at'],
        order: [['published_at', 'DESC']],
        limit: 6
      });
    }

    const allArticles = [...latest, ...mostViewed, ...personalized];

    const articleIds = allArticles.map(a => a.id);

    const coSubcats = await Subcategory.findAll({
      attributes: ['id', 'category_id'],
      where: {
        '$articles.id$': { [Op.in]: articleIds }
      },
      include: {
        model: Article,
        as: 'articles',
        attributes: [],
        through: { attributes: [] }
      }
    });

    const categoryCount = {};

    for (const subcat of coSubcats) {
      const cid = subcat.category_id;
      if (cid !== category.id) {
        categoryCount[cid] = (categoryCount[cid] || 0) + 1;
      }
    }

    const tagCount = {};
    personalized.forEach(a => {
      a.hashtags.forEach(h => {
        tagCount[h.id] = (tagCount[h.id] || 0) + 1;
      })
    });

    mostViewed.forEach(a => {
      a.hashtags.forEach(h => {
        tagCount[h.id] = (tagCount[h.id] || 0) + 1;
      });
    });

    latest.forEach(a => {
      a.hashtags.forEach(h => {
        tagCount[h.id] = (tagCount[h.id] || 0) + 1;
      });
    });
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => entry[0]);

    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => entry[0]);

    // 6. 6 Related categories
    const relatedCategories = await Category.findAll({
      where: {
        id: {
          [Op.in]: topCategories,
          [Op.ne]: category.id
        }
      },
      limit: 6,
      attributes: ['id', 'name']
    });


    // 7. 6 trending hashtags
    const hashtags = await Hashtag.findAll({
      where: {
        id: {
          [Op.in]: topTags,
        }
      },
      limit: 6,
      attributes: ['id', 'name']
    });

    req.data = {
      category: category,
      mostViewed,
      latest,
      personalized,
      relatedCategories,
      hashtags
    }
    // Send final response
    next();

  } catch (error) {
    console.error('Error loading category page content:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSearchPageContent = async (req, res, next) => {
  const { q } = req.query;
  const user_id = req.userData?.userId;

  try {



    const totalArticles = await Article.count({
      where: { status: 'published' }
    });;
    if (totalArticles === 0) {
      req.data = {
        results: [],
        mostViewed: [],
        hashtags: [],
        relatedCategories: [],
        personalized: []
      };

      return next();
    }

    // 2. Fetch latest articles in this category
    const result = await Article.findAll({
      where: { status: 'published' },
      attributes: ['id', 'title', 'slug', 'image', 'excerpt', 'published_at', 'read_duration'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_pic']
        },
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name'],
          include: {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          through: { attributes: [] }
        },
        {
          model: Hashtag,
          as: 'hashtags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
      ],
      order: [['published_at', 'DESC']],
      limit: 10
    });


    // 3. Most viewed articles in this category
    const interactions = await UserInteraction.findAll({
      attributes: [
        'article_id',
        [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'views']
      ],
      where: {
        interaction_type: 'view',
        createdAt: { [Op.gte]: Sequelize.literal('NOW() - INTERVAL 10 DAY') }
      },
      group: ['article_id'],
      order: [[Sequelize.literal('views'), 'DESC']],
      raw: true
    });

    const topViewedIds = interactions.map(i => i.article_id);

    const mostViewed = await Article.findAll({
      where: {
        id: topViewedIds
      },
      include: [{
        model: Subcategory,
        as: 'subcategories',
        attributes: ['id'],
        where: { id: subcategoryIds },
        through: { attributes: [] }
      },
      {
        model: Hashtag,
        as: 'hashtags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      },
      ],
      attributes: ['id', 'title', 'slug', 'image', 'published_at'],
      limit: 5
    });

    // 5. Personalized recommendations
    let personalized = [];
    if (user_id) {
      const viewed = await UserInteraction.findAll({
        attributes: ['article_id'],
        where: {
          user_id,
          interaction_type: 'view'
        },
        raw: true
      });

      const viewedIds = viewed.map(v => v.article_id);

      personalized = await Article.findAll({
        where: {
          id: { [Op.notIn]: [...viewedIds] }
        },
        include: [
          {
            model: Hashtag,
            as: 'hashtags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          },
          {
            model: Subcategory,
            as: 'subcategories',
            attributes: ['id'],
            where: { id: subcategoryIds },
            through: { attributes: [] }
          }],
        attributes: ['id', 'title', 'slug', 'image', 'published_at'],
        order: [['published_at', 'DESC']],
        limit: 6
      });
    }

    const allArticles = [...latest, ...mostViewed, ...personalized];

    const articleIds = allArticles.map(a => a.id);

    const coSubcats = await Subcategory.findAll({
      attributes: ['id', 'category_id'],
      where: {
        '$articles.id$': { [Op.in]: articleIds }
      },
      include: {
        model: Article,
        as: 'articles',
        attributes: [],
        through: { attributes: [] }
      }
    });

    const categoryCount = {};

    for (const subcat of coSubcats) {
      const cid = subcat.category_id;
      if (cid !== category.id) {
        categoryCount[cid] = (categoryCount[cid] || 0) + 1;
      }
    }

    const tagCount = {};
    personalized.forEach(a => {
      a.hashtags.forEach(h => {
        tagCount[h.id] = (tagCount[h.id] || 0) + 1;
      })
    });

    mostViewed.forEach(a => {
      a.hashtags.forEach(h => {
        tagCount[h.id] = (tagCount[h.id] || 0) + 1;
      });
    });

    latest.forEach(a => {
      a.hashtags.forEach(h => {
        tagCount[h.id] = (tagCount[h.id] || 0) + 1;
      });
    });
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => entry[0]);

    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => entry[0]);

    // 6. 6 Related categories
    const relatedCategories = await Category.findAll({
      where: {
        id: {
          [Op.in]: topCategories,
          [Op.ne]: category.id
        }
      },
      limit: 6,
      attributes: ['id', 'name']
    });


    // 7. 6 trending hashtags
    const hashtags = await Hashtag.findAll({
      where: {
        id: {
          [Op.in]: topTags,
        }
      },
      limit: 6,
      attributes: ['id', 'name']
    });

    req.data = {
      category: category,
      mostViewed,
      latest,
      personalized,
      relatedCategories,
      hashtags
    }
    // Send final response
    next();

  } catch (error) {
    console.error('Error loading category page content:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Dummy time ago
function timeAgo(time) {
  const now = new Date();
  const past = new Date(time);
  const seconds = Math.floor((now - past) / 1000);
  const daysDiff = Math.floor(seconds / 86400);

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (seconds < 60) {
    return 'just now';
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  } else if (seconds < 86400) {
    const hrs = Math.floor(seconds / 3600);
    return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  } else if (daysDiff < 7 && past.getWeekNumber() === now.getWeekNumber()) {
    return weekdays[past.getDay()];
  } else {
    return past.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

// Helper to get ISO week number
Date.prototype.getWeekNumber = function () {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the week number.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};

exports.getHashtagPageContent = async (req, res, next) => {
  const { hashtagName } = req.params;
  const user_id = req.userData?.userId;

  req.path = `/hashtag/${hashtagName}`;
  try {
    // 1. Find the hashtag
    const hashtag = await Hashtag.findOne({
      where: { name: hashtagName },
      attributes: ['id', 'name'],
    });

    if (!hashtag) {
      return res.status(404).json({ message: 'Hashtag not found' });
    }

    // 2. Fetch latest articles with this hashtag
    const latest = await Article.findAll({
      where: { status: 'published' },
      attributes: ['id', 'title', 'slug', 'image', 'excerpt', 'published_at'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_pic']
        },
        {
          model: Hashtag,
          as: 'hashtags',
          where: { id: hashtag.id },
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name'],
          include: {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          through: { attributes: [] }
        },
      ],
      order: [['published_at', 'DESC']],
      limit: 10
    });

    // 3. Most viewed articles with this hashtag
    const interactions = await UserInteraction.findAll({
      attributes: [
        'article_id',
        [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'views']
      ],
      where: {
        interaction_type: 'view',
        createdAt: { [Op.gte]: Sequelize.literal('NOW() - INTERVAL 10 DAY') }
      },
      group: ['article_id'],
      order: [[Sequelize.literal('views'), 'DESC']],
      raw: true
    });

    const topViewedIds = interactions.map(i => i.article_id);

    const mostViewed = await Article.findAll({
      where: {
        [Op.and]: [
          { id: topViewedIds },
          { id: { [Op.notIn]: latest.map(l => l.id) } }
        ]
      },
      include: [
        {
          model: Hashtag,
          as: 'hashtags',
          where: { id: hashtag.id },
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Subcategory,
          as: 'subcategories',
          through: { attributes: [] }
        }
      ],
      attributes: ['id', 'title', 'slug', 'image', 'published_at'],
      limit: 5
    });

    // 4. Personalized recommendations
    let personalized = [];
    if (user_id) {
      const viewed = await UserInteraction.findAll({
        attributes: ['article_id'],
        where: {
          user_id,
          interaction_type: 'view'
        },
        raw: true
      });

      const viewedIds = viewed.map(v => v.article_id);

      personalized = await Article.findAll({
        where: {
          status: 'published',
          id: { [Op.notIn]: [...viewedIds, ...latest.map(l => l.id)], ...mostViewed.map(f => f.id) }
        },
        include: [
          {
            model: Hashtag,
            as: 'hashtags',
            where: { id: hashtag.id },
            attributes: ['id', 'name'],
            through: { attributes: [] }
          },
          {
            model: Subcategory,
            as: 'subcategories',
            through: { attributes: [] }
          }
        ],
        attributes: ['id', 'title', 'slug', 'image', 'published_at'],
        order: [['published_at', 'DESC']],
        limit: 6
      });
    }

    // Collect related categories and hashtags from article pool
    const allArticles = [...latest, ...mostViewed, ...personalized];
    const articleIds = allArticles.map(a => a.id);

    const coSubcats = await Subcategory.findAll({
      attributes: ['id', 'category_id'],
      where: {
        '$articles.id$': { [Op.in]: articleIds }
      },
      include: {
        model: Article,
        as: 'articles',
        attributes: [],
        through: { attributes: [] }
      }
    });

    const allTags = await Hashtag.findAll({
      attributes: ['id', 'name'],
      where: {
        id: { [Op.notIn]: [hashtag.id] },
        '$articles.id$': { [Op.in]: articleIds }
      },
      include: {
        model: Article,
        as: 'articles',
        attributes: [],
        through: { attributes: [] }
      }
    });

    const categoryCount = {};

    coSubcats.forEach(subcat => {
      const cid = subcat.category_id;
      categoryCount[cid] = (categoryCount[cid] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => entry[0]);

    const relatedCategories = await Category.findAll({
      where: {
        id: { [Op.in]: topCategories }
      },
      attributes: ['id', 'name']
    });

    // Send final response
    req.data = {
      hashtag: hashtag.name,
      latest,
      mostViewed,
      personalized,
      relatedCategories,
      hashtags: allTags
    };

    next();

  } catch (error) {
    console.error('Error loading hashtag page content:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getOneArticlePerSubcategory = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: {
        model: Subcategory,
        as: 'subcategories',
        include: {
          model: Article,
          as: 'articles',
          separate: true, // Fetch articles in a separate query per subcategory
          limit: 1,       // Limit to 1 article per subcategory
          order: [['published_at', 'DESC']]
        }
      }
    });

    // Flatten all articles into a single array
    const flattenedArticles = categories
      .flatMap(cat => cat.subcategories)
      .flatMap(sub => sub.articles || []); // handle case where no articles

    res.json({ articles: flattenedArticles });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.search = async (req, res) => {
  const search = req.params.search.toLowerCase();
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  let colors = ['pink', 'info', 'success', 'danger', 'primary', 'secondary'];
  try {
    const [articles, users, categories] = await Promise.all([
      Article.findAll({
        where: { status: 'published' },
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'profile_pic'] }],
        attributes: ['id', 'title', 'slug', 'image', 'excerpt', 'published_at', 'read_duration'],
        order: [['createdAt', 'DESC']]
      }),
      User.findAll({
        attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'profile_pic', 'bio'],
        order: [['createdAt', 'DESC']]
      }),
      Category.findAll({
        attributes: ['id', 'name', 'description'],
        order: [['createdAt', 'DESC']]
      }),
    ]);

    const results = [];
    const alreadyAdded = new Set();

    // Search and push results
    const addResult = (key, html) => {
      if (!alreadyAdded.has(key)) {
        alreadyAdded.add(key);
        results.push(html);
      }
    };

    // 1. Article title
    for (let article of articles) {
      if (article.title.toLowerCase().includes(search)) {
        addResult(`article-${article.id}`, `
          <div data-found-title class="col-md-6">
            <div class="card h-100 shadow-sm">
              <img src="${article.image}" class="card-img-top news-img" alt="News Image">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                  <img src="${article.author.profile_pic}" class="author-img me-2" width="30" height="30">
                  <span class="fw-bold">${article.author.username}</span>
                  <span class="ms-auto text-muted small">${timeAgo(article.published_at)}</span>
                </div>
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.excerpt}</p>
                <a href="/article/${article.slug}" class="btn btn-outline-pink btn-sm mt-2">Read More</a>
              </div>
            </div>
          </div>
        `);
      }
    }

    // 2. Categories
    for (let category of categories) {
      if (category.name.toLowerCase().includes(search)) {
        addResult(`category-${category.id}`, `
          <a href="/category/${category.name}" class="text-decoration-none">
            <div class="col-md-3">
              <div class="card bg-${colors[category.id % 6]} text-white shadow-sm text-center">
                <div class="card-body">
                  <h5 class="card-title">${category.name}</h5>
                  <p class="small">${category.description}</p>
                </div>
              </div>
            </div>
          </a>
        `);
      }
    }

    // 3. Users
    for (let user of users) {
      const fullName = `${user.first_name} ${user.last_name}`;
      if (
        user.username.toLowerCase().includes(search) ||
        fullName.toLowerCase().includes(search) ||
        (user.email && user.email.toLowerCase().includes(search))
      ) {
        addResult(`user-${user.id}`, `
          <div class="col-md-4">
            <div class="card text-center shadow-sm">
              <img src="${user.profile_pic}" class="author-img mx-auto mt-3" width="60" height="60">
              <div class="card-body">
                <h5 class="card-title">@${user.username}</h5>
                <h6 class="card-title">${fullName}</h6>
                <p class="card-text small text-muted">${user.bio || ''}</p>
              </div>
            </div>
          </div>
        `);
      }
    }

    // 4. Slug or excerpt
    for (let article of articles) {
      const key = `article-${article.id}`;
      if (alreadyAdded.has(key)) continue;

      const matchField = ['slug', 'excerpt'].find(field =>
        article[field]?.toLowerCase().includes(search)
      );

      if (matchField) {
        addResult(key, `
          <div data-found-${matchField} class="col-md-6">
            <div class="card h-100 shadow-sm">
              <img src="${article.image}" class="card-img-top news-img">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                  <img src="${article.author.profile_pic}" class="author-img me-2" width="30" height="30">
                  <span class="fw-bold">${article.author.username}</span>
                  <span class="ms-auto text-muted small">${timeAgo(article.published_at)}</span>
                </div>
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.excerpt}</p>
                <a href="/article/${article.slug}" class="btn btn-outline-pink btn-sm mt-2">Read More</a>
              </div>
            </div>
          </div>
        `);
      }
    }

    // Paginate response
    const paginated = results.slice(offset, offset + limit);
    const isLastPage = offset + limit >= results.length;

    res.json({ html: paginated.join(""), isLastPage });

  } catch (error) {
    console.error("Error performing search:", error);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

