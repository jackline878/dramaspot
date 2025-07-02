const { Article, UserInteraction } = require('../models');
const { Op, Sequelize } = require('sequelize');
const use = require('@tensorflow-models/universal-sentence-encoder');
const tf = require('@tensorflow/tfjs-node');

// Helper: Calculate cosine similarity between vectors
function cosineSimilarity(vecA, vecB) {
  const dot = tf.sum(tf.mul(vecA, vecB)).arraySync();
  const magA = tf.norm(vecA).arraySync();
  const magB = tf.norm(vecB).arraySync();
  return dot / (magA * magB);
}

exports.getPersonalizedRecommendations = async (req, res) => {
  const { user_id, current_article_id } = req.params;

  if (!user_id || !current_article_id) {
    return res.status(400).json({ message: "Missing user_id or current_article_id" });
  }

  try {
    const currentArticle = await Article.findByPk(current_article_id);
    if (!currentArticle) return res.status(404).json({ message: 'Current article not found' });

    const hashtags = currentArticle.hashtags || [];

    // Hashtag relevance condition
    const tagConditions = hashtags.map(tag => ({
      hashtags: { [Op.like]: `%${tag}%` }
    }));

    // User viewed articles
    const viewed = await UserInteraction.findAll({
      where: {
        user_id,
        interaction_type: 'view',
      },
      attributes: ['article_id', [Sequelize.fn('COUNT', Sequelize.col('article_id')), 'views']],
      group: ['article_id'],
      raw: true,
      limit: 30,
    });

    const viewedArticleIds = viewed.map(v => v.article_id);

    const viewedArticles = await Article.findAll({
      where: { id: viewedArticleIds },
      attributes: ['id', 'category_id'],
      raw: true,
    });

    // Count category frequency
    const categoryCount = {};
    viewedArticles.forEach(a => {
      categoryCount[a.category_id] = (categoryCount[a.category_id] || 0) + 1;
    });
    categoryCount[currentArticle.category_id] = (categoryCount[currentArticle.category_id] || 0) + 5;

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    // Step 1: Hashtag-based Recommendations
    const hashtagArticles = await Article.findAll({
      where: {
        id: { [Op.notIn]: [...viewedArticleIds, current_article_id] },
        [Op.or]: tagConditions
      },
      limit: 10,
      order: [['published_at', 'DESC']]
    });

    const hashtagArticleIds = hashtagArticles.map(a => a.id);

    // Step 2: Category-based Recommendations
    const categoryArticles = await Article.findAll({
      where: {
        category_id: topCategories,
        id: { [Op.notIn]: [...viewedArticleIds, current_article_id, ...hashtagArticleIds] }
      },
      limit: 20,
      order: [['published_at', 'DESC']]
    });

    // Step 3: Semantic similarity using Universal Sentence Encoder
    const embedder = await use.load();
    const currentEmbedding = await embedder.embed([currentArticle.title + ' ' + currentArticle.content]);
    const candidateArticles = [...categoryArticles, ...hashtagArticles];

    const texts = candidateArticles.map(a => a.title + ' ' + a.content);
    const embeddings = await embedder.embed(texts);
    const similarities = embeddings.unstack().map((emb, index) => ({
      article: candidateArticles[index],
      similarity: cosineSimilarity(currentEmbedding.squeeze(), emb),
    }));

    // Sort by similarity and pick top 10
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topArticles = similarities.slice(0, 10).map(s => s.article);

    res.json({ recommended: topArticles });

  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
