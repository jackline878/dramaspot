const {
    Comment,
    Article,
    Like,
    Notification,
    User,
    Section,
    SectionContent,
    Hashtag,
    Category,
    Subcategory,
    UserInteraction
} = require('./models');
const { Op, Sequelize, fn, col, where } = require('sequelize');
function renderComments(commentsArr, article_id = null, level = 0) {
    let html = '';
    commentsArr.forEach(comment => {
        html += `
                <div class="comment-box mb-3" data-comment-id="${comment.id}" style="${level === 1 ? 'margin-left:3.5rem;' : ''}">
                    <div class="d-flex align-items-start">
                        <img src="${comment.user.profile_pic}" class="${level === 0 ? 'comment-avatar' : 'reply-avatar'} me-3" alt="${comment.user.username}">
                        <div class="flex-grow-1">
                            <div>
                                <span class="fw-bold">${comment.user.username}</span>
                                <span class="text-muted small ms-2">${timeAgo(comment.createdAt)}</span>
                            </div>
                            <div class="mt-1 mb-2">${escapeHTML(comment.content)}</div>
                            <div class="${level === 0 ? 'comment-actions' : 'reply-actions'} d-flex align-items-center gap-3">
                                <span class=" like-btn like-comment-btn ${comment.isLiked ? 'liked' : ''}" data-id="${comment.id}"  data-type="Comment">
                                    <i class="bi bi-heart${comment.isLiked ? '-fill' : ''}"></i> <span class="like-count">${comment.likesCount}</span>
                                </span>
                                ${level < 2 ? `<span style="cursor: pointer;" class="reply-btn text-primary"data-article="${article_id}" data-id="${comment.id}" data-level="${level}"><i class="bi bi-reply"></i> Reply</span>` : ''}
                            </div>
                            <div class="reply-form-container mt-2"></div>
                            ${level < 2 && comment.repliesCount && comment.repliesCount > 0 ? `
                        <span style="cursor: pointer;" data-article="${article_id}" data-id="${comment.id}" data-level="${level}" class=" view-reply text-primary">View Replies (${comment.repliesCount})</span>
                    ` : ''}
                        </div>
                    </div>
                    ${level < 2 && comment.repliesCount && comment.repliesCount > 0 ? `
                        <div data-id="${comment.id}" class="replies mt-3">
                        </div>
                    ` : ''}
                </div>
                `;
    });
    return html;
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

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


class OneComment {
    constructor(id) {
        this.id = id;
    }

    async getComment() {
        const comment = await Comment.findOne({
            where: { id: this.id },
            include: [
                {
                    model: Article,
                    as: 'article',
                    attributes: ['id', 'title'],
                },
                {
                    model: Comment,
                    as: 'parent',
                    attributes: ['id', 'content'],
                    include: [
                        {
                            model: Article,
                            as: 'article',
                            attributes: ['id', 'title'],
                        },
                        {
                            model: Comment,
                            as: 'parent',
                            attributes: ['id', 'content'],
                            include: [
                                {
                                    model: Article,
                                    as: 'article',
                                    attributes: ['id', 'title'],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (!comment) return null;

        if (comment.parent) {
            if (comment.parent.parent) {
                return {
                    comment_id: comment.id,
                    parent_id: comment.parent.id,
                    g_parent_id: comment.parent.parent.id,
                    article_id: comment.parent.parent.article?.id || null,
                };
            } else {
                return {
                    comment_id: comment.id,
                    parent_id: comment.parent.id,
                    article_id: comment.parent.article?.id || null,
                };
            }
        } else {
            return {
                comment_id: comment.id,
                article_id: comment.article?.id || null,
            };
        }
    }

    static async getComment(id) {
        const instance = new OneComment(id);
        return await instance.getComment();
    }
}

class OneLike {
    constructor(id) {
        this.id = id;
    }

    async getLiked() {
        const like = await Like.findOne({
            where: { id: this.id },
            include: [
                {
                    model: Article,
                    as: 'article',
                    attributes: ['id', 'title'],
                },
                {
                    model: Comment,
                    as: 'comment',
                    attributes: ['id', 'content'],
                },
            ],
        });

        if (!like) return null;

        if (like.comment) {
            const commentDetails = await OneComment.getComment(like.comment.id);
            return commentDetails;
        } else {
            return {
                article_id: like.article?.id || null,
            };
        }
    }

    static async getLiked(id) {
        const instance = new OneLike(id);
        return await instance.getLiked();
    }
}

class AllNotification {
    constructor(userId, page = 1, limit = 10) {
        this.userId = userId;
        this.page = page;
        this.limit = limit;
    }

    async getNotification() {
        const notifications = await Notification.findAll({
            where: { target_id: this.userId },
            include: [
                {
                    model: User,
                    as: 'Source',
                    attributes: ['id', 'username', 'profile_pic'],
                },
            ],
            order: [['createdAt', 'DESC']],
            offset: (this.page - 1) * this.limit,
            limit: this.limit,
        });

        if (!notifications.length) return [];

        return await Promise.all(
            notifications.map(async (notification) => {
                const data = {
                    id: notification.id,
                    type: notification.type,
                    message: notification.message,
                    isRead: notification.isRead,
                    source: notification.Source,
                };

                if (notification.type === 'like') {
                    data.likeDetails = await OneLike.getLiked(notification.item_id);
                } else if (['comment', 'reply'].includes(notification.type)) {
                    data.commentDetails = await OneComment.getComment(notification.item_id);
                }

                return data;
            })
        );
    }

    static async getNotification(userId, page = 1, limit = 10) {
        const instance = new AllNotification(userId, page, limit);
        return await instance.getNotification();
    }
}

class IsLiked {
    constructor(id, type, userId) {
        this.likeableId = parseInt(id);
        this.likeableType = type;
        this.userId = parseInt(userId);
    }

    async isLiked() {

        const like = await Like.findOne({
            where: {
                user_id: this.userId,
                likeable_id: this.likeableId,
                likeable_type: this.likeableType,
            },
        });
        return !!like;
    }

    static async isLiked(id, type, userId) {
        const instance = new IsLiked(id, type, userId);
        return await instance.isLiked();
    }
}

class AllComments {
    constructor(article_id, page = 1, limit = 10, userId) {
        this.article_id = article_id;
        this.page = page;
        this.limit = limit;
        this.userId = userId;
    }


    async getAllComments() {
        const comments = await Comment.findAll({
            where: { article_id: this.article_id, parent_comment_id: null },
            include: [
                {
                    model: Comment,
                    as: 'replies',
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'profile_pic'],
                },
                {
                    model: Like,
                    as: 'likes',
                    attributes: ['id'],
                },
            ],
            offset: (this.page - 1) * this.limit,
            limit: this.limit,
            order: [['createdAt', 'DESC']],
        });

        console.log(this.userId);
        const foundComments = await Promise.all(
            comments.map(async (comment) => {
                const isLiked = this.userId
                    ? await IsLiked.isLiked(comment.id, 'Comment', this.userId)
                    : false;

                return {
                    id: comment.id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    isLiked,
                    user: {
                        id: comment.user.id,
                        username: comment.user.username,
                        profile_pic: comment.user.profile_pic,
                    },
                    repliesCount: comment.replies.length,
                    likesCount: comment.likes.length,
                };
            })
        );
        return renderComments(foundComments, this.article_id, 0);
    }

    static async getAllComments(article_id, page = 1, limit = 10, userId) {
        const instance = new AllComments(article_id, page, limit, userId);
        return await instance.getAllComments();
    }
}

class Replies {
    constructor(commentId, userId, article_id, level, page = 1, limit = 10) {
        this.commentId = commentId;
        this.page = page;
        this.limit = limit;
        this.userId = userId;
        this.article_id = article_id;
        this.level = level;
    }

    async getReplies() {
        const comment = await Comment.findByPk(this.commentId, {
            include: [
                {
                    model: Comment,
                    as: 'replies',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'profile_pic'],
                        },
                        {
                            model: Like,
                            as: 'likes',
                            attributes: ['id'],
                        },
                        {
                            model: Comment,
                            as: 'replies',
                            attributes: ['id'],
                        },
                    ],
                },
            ],
        });

        if (!comment) return [];

        const foundReplies = await Promise.all(
            comment.replies.map(async (reply) => {
                const isLiked = this.userId
                    ? await IsLiked.isLiked(reply.id, 'Comment', this.userId)
                    : false;

                return {
                    id: reply.id,
                    content: reply.content,
                    createdAt: reply.createdAt,
                    isLiked,
                    likesCount: reply.likes.length,
                    repliesCount: reply.replies.length,
                    user: {
                        id: reply.user.id,
                        username: reply.user.username,
                        profile_pic: reply.user.profile_pic,
                    },
                };
            })
        );

        return renderComments(foundReplies, this.article_id, this.level);
    }

    static async getReplies(commentId, userId, article_id, level, page = 1, limit = 10) {
        const instance = new Replies(commentId, userId, article_id, level, page, limit);
        return await instance.getReplies();
    }
}

class GetArticle {
    constructor(slug, userId) {
        this.slug = slug;
        this.userId = userId;
    }

    async getArticle() {
const articleData = await Article.findOne({
    where: { slug: this.slug },
    include: [
        {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'email', 'profile_pic', 'role'],
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
            ]
        },
        {
            model: Hashtag,
            as: 'hashtags',
            attributes: ['id', 'name'],
        },
        {
            model: Like,
            as: 'likes',
            attributes: ['id'],
        },
        {
            model: Section,
            as: 'sections',
            include: [
                {
                    model: SectionContent,
                    as: 'contents',
                    // Ordering of contents must be defined at the root `order` option
                },
            ],
        },
    ],
    order: [
        // Order sections by `order`
        [{ model: Section, as: 'sections' }, 'order', 'ASC'],
        // Then order each section's contents by `order`
        [{ model: Section, as: 'sections' }, { model: SectionContent, as: 'contents' }, 'id', 'ASC'],
    ],
});


        if (!articleData) return null;

        // Convert to plain object so we can add new properties
        const article = articleData.get({ plain: true });

        // Add custom fields
        article.published_at = timeAgo(article.published_at);
        article.isLiked = this.userId
            ? await IsLiked.isLiked(article.id, 'Article', this.userId)
            : false;

        article.likesCount = article.likes ? article.likes.length : 0;

        article.comments = await AllComments.getAllComments(article.id, 1, 10, this.userId);

        let viewed = [];
        // Step 2: Get article IDs the user already viewed
        if (this.userId) {
            viewed = await UserInteraction.findAll({
                where: {
                    user_id: parseInt(this.userId),
                    interaction_type: 'view',
                },
                attributes: ['article_id'],
                raw: true
            });

        }


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

        article.subcategories.forEach(s => {
            categories.push(s.category);
            categoryCount[s.id] = (categoryCount[s.id] || 0) + 1;
        })

        article.hashtags.forEach(h => {
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
                id: { [Op.notIn]: [article.id, ...viewedIds] } // exclude already viewed
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
            where: {
                id: {
                    [Op.in]: articleIds,
                    [Op.notIn]: [article.id, ...viewedIds]  // exclude current + already viewed
                }
            },
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
                id: { [Op.notIn]: [article.id, ...viewedIds, ...hashtagArticleIds] } // exclude already viewed
            },
            order: [['published_at', 'DESC']],
            limit: 10,
            distinct: true // avoid duplicates due to joins
        });


        return { article, categories: categories, mostViewed, recommended: [], related: [...HashtagArticles, ...categoryArticles].slice(0, 10) };

    }

    static async getArticle(slug, userId) {
        const instance = new GetArticle(slug, userId);
        return await instance.getArticle();
    }
}

module.exports = {
    OneComment,
    OneLike,
    AllNotification,
    AllComments,
    Replies,
    IsLiked,
    GetArticle,
};
