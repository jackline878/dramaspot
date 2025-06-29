const { Article, User, Comment, UserInteraction, Activity, Like } = require('./models'); // Adjust path as needed
const { Op, fn, col, literal } = require('sequelize');

/**
 * dashboardController.js
 * Controller for fetching dashboard data for Drama Spots Admin Dashboard.
 * Assumes usage of Express.js and Sequelize ORM.
 */

// Helper for date range
function getDateNDaysAgo(days) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - days + 1);
    return d;
}

// Fetch dashboard summary stats
async function getDashboardStats() {
    try {
        // Total data to date
        const [pageViews, totalLikes, totalShares, totalComments, totalArticles, activeUsers] = await Promise.all([
            UserInteraction.count({
                where: { interaction_type: 'view' }
            }),
            Like.count({
                where: { likeable_type: 'Article' }
            }),
            UserInteraction.count({
                where: { interaction_type: 'share' }
            }),
            Comment.count({
                where: {
                    article_id: { [Op.ne]: null },
                    parent_comment_id: null,
                    is_approved: true
                }
            }),
            Article.count(),
            User.count()
        ]);

        // Last 7 days
        const last7Days = getDateNDaysAgo(7);
        const [
            pageViews7,
            totalLikes7,
            totalShares7,
            totalComments7,
            totalArticles7,
            activeUsers7
        ] = await Promise.all([
            UserInteraction.count({
                where: {
                    interaction_type: 'view',
                    createdAt: { [Op.gte]: last7Days }
                }
            }),
            Like.count({
                where: {
                    likeable_type: 'Article',
                    createdAt: { [Op.gte]: last7Days }
                }
            }),
            UserInteraction.count({
                where: {
                    interaction_type: 'share',
                    createdAt: { [Op.gte]: last7Days }
                }
            }),
            Comment.count({
                where: {
                    article_id: { [Op.ne]: null },
                    parent_comment_id: null,
                    is_approved: true,
                    createdAt: { [Op.gte]: last7Days }
                }
            }),
            Article.count({
                where: {
                    createdAt: { [Op.gte]: last7Days }
                }
            }),
            User.count({
                where: {
                    lastLogin: {
                        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        // Growth calculations (percent change)
        function growth(current, previous) {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        }

        // Prepare stats for HTML rendering
        const stats = {
            totalArticles,
            activeUsers,
            totalComments,
            totalLikes,
            totalShares,
            pageViews,
            articlesGrowth: growth(totalArticles7, totalArticles - totalArticles7),
            usersGrowth: growth(activeUsers7, activeUsers - activeUsers7),
            commentsGrowth: growth(totalComments7, totalComments - totalComments7),
            viewsGrowth: growth(pageViews7, pageViews - pageViews7),
            sharesGrowth: growth(totalShares7, totalShares - totalShares7),
            likesGrowth: growth(totalLikes7, totalLikes - totalLikes7)
        };

        // Render HTML with dynamic values
        return `
        <!-- Dashboard Stats -->
        <div class="row g-4 mb-4">
            <div class="col-12 col-md-6 col-lg-3">
            <div class="card shadow-sm border-0">
                <div class="card-body d-flex align-items-center">
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width:56px;height:56px;">
                    <i class="bi bi-pencil-square fs-3"></i>
                </div>
                <div>
                    <h6 class="card-title mb-1">Total Posts</h6>
                    <h3 class="mb-0">${stats.totalArticles.toLocaleString()}</h3>
                    <span class="text-${stats.articlesGrowth >= 0 ? 'success' : 'danger'} small">
                    <i class="bi bi-arrow-${stats.articlesGrowth >= 0 ? 'up' : 'down'}"></i>
                    ${Math.abs(stats.articlesGrowth)}% this week
                    </span>
                </div>
                </div>
            </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
            <div class="card shadow-sm border-0">
                <div class="card-body d-flex align-items-center">
                <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width:56px;height:56px;">
                    <i class="bi bi-people fs-3"></i>
                </div>
                <div>
                    <h6 class="card-title mb-1">Active Users</h6>
                    <h3 class="mb-0">${stats.activeUsers.toLocaleString()}</h3>
                    <span class="text-${stats.usersGrowth >= 0 ? 'success' : 'danger'} small">
                    <i class="bi bi-arrow-${stats.usersGrowth >= 0 ? 'up' : 'down'}"></i>
                    ${Math.abs(stats.usersGrowth)}% this week
                    </span>
                </div>
                </div>
            </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
            <div class="card shadow-sm border-0">
                <div class="card-body d-flex align-items-center">
                <div class="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width:56px;height:56px;">
                    <i class="bi bi-chat-dots fs-3"></i>
                </div>
                <div>
                    <h6 class="card-title mb-1">Comments</h6>
                    <h3 class="mb-0">${stats.totalComments.toLocaleString()}</h3>
                    <span class="text-${stats.commentsGrowth >= 0 ? 'success' : 'danger'} small">
                    <i class="bi bi-arrow-${stats.commentsGrowth >= 0 ? 'up' : 'down'}"></i>
                    ${Math.abs(stats.commentsGrowth)}% this week
                    </span>
                </div>
                </div>
            </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
            <div class="card shadow-sm border-0">
                <div class="card-body d-flex align-items-center">
                <div class="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width:56px;height:56px;">
                    <i class="bi bi-eye fs-3"></i>
                </div>
                <div>
                    <h6 class="card-title mb-1">Page Views</h6>
                    <h3 class="mb-0">${stats.pageViews.toLocaleString()}</h3>
                    <span class="text-${stats.viewsGrowth >= 0 ? 'success' : 'danger'} small">
                    <i class="bi bi-arrow-${stats.viewsGrowth >= 0 ? 'up' : 'down'}"></i>
                    ${Math.abs(stats.viewsGrowth)}% this week
                    </span>
                </div>
                </div>
            </div>
            </div>
        </div>
        `;
    } catch (err) {
        return ``;
    }
}

// Fetch traffic chart data (visitors and page views per day for last 7 days)
async function getTrafficChart() {
    try {
        const days = 7;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = getDateNDaysAgo(days);

        // Visitors: count users whose accounts were created on each day (first-time visitors)
        const visitors = await User.findAll({
            attributes: [
            [fn('DATE', col('createdAt')), 'date'],
            [fn('COUNT', col('id')), 'count']
            ],
            where: {
            createdAt: { [Op.gte]: startDate }
            },
            group: [fn('DATE', col('createdAt'))],
            raw: true
        });

        // Page Views: count per day
        const views = await UserInteraction.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                interaction_type: 'view',
                createdAt: { [Op.gte]: startDate }
            },
            group: [fn('DATE', col('createdAt'))],
            raw: true
        });

        // Format data for chart.js
        const labels = [];
        const visitorsData = [];
        const viewsData = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dateStr = d.toISOString().slice(0, 10);
            labels.push(dateStr);

            const visitor = visitors.find(v => v.date === dateStr);
            visitorsData.push(visitor ? parseInt(visitor.count) : 0);

            const view = views.find(v => v.date === dateStr);
            viewsData.push(view ? parseInt(view.count) : 0);
        }

        return {
            labels,
            visitors: visitorsData,
            pageViews: viewsData
        };
    } catch (err) {
    return ``;
    }
}

// Fetch recent articles (limit 5)
async function getRecentArticles() {
    try {
        // Get recent articles
        const articles = await Article.findAll({
            include: [
                { model: User, as: 'author', attributes: ['id', 'first_name', 'last_name', 'profile_pic'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Get view counts for these articles
        const articleIds = articles.map(article => article.id);
        const views = await UserInteraction.findAll({
            attributes: ['article_id', [fn('COUNT', col('id')), 'views']],
            where: {
                interaction_type: 'view',
                article_id: { [Op.in]: articleIds }
            },
            group: ['article_id'],
            raw: true
        });

        // Map article_id to views count
        const viewsMap = {};
        views.forEach(v => {
            viewsMap[v.article_id] = parseInt(v.views, 10);
        });

        // Render HTML table for recent articles
        return `
            <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Recent Posts</h5>
                <a href="#" class="btn btn-sm btn-outline-primary">View All</a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive scrollable-table">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${articles.map(article => `
                        <tr>
                        <td>
                            <a href="/article/${article.slug}" class="text-decoration-none">${article.title}</a>
                        </td>
                        <td>
                            ${article.author && article.author.profile_pic ? `<img src="${article.author.profile_pic}" class="table-avatar me-2" alt="Author">` : ''}
                            ${article.author ? `${article.author.first_name||''} ${article.author.last_name||''}` : 'Unknown'}
                        </td>
                        <td>${article.createdAt.toISOString().slice(0, 10)}</td>
                        <td>
                            <span class="badge ${
                            article.status === 'Published' ? 'bg-success' :
                            article.status === 'Draft' ? 'bg-warning text-dark' :
                            article.status === 'Archived' ? 'bg-danger' : 'bg-secondary'
                            } badge-status">${article.status}</span>
                        </td>
                        <td>${(viewsMap[article.id] || 0).toLocaleString()}</td>
                        <td>
                            <button onclick="window.location.href='/article/edit?id=${article.id}'" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                            <button onclick="deletePost(${article.id})" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                        </td>
                        </tr>
                    `).join('')}
                    </tbody>
                </table>
                </div>
            </div>
            </div>
        `;
    } catch (err) {
    return ``;
    }
}

// Fetch recent comments (limit 5)
async function getRecentComments() {
    try {
        const comments = await Comment.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'profile_pic'] },
                { model: Article, as: 'article', attributes: ['id', 'title', 'slug'] }
            ],
            where: {
                article_id: { [Op.ne]: null },
                parent_comment_id: null,
                is_approved: true
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Render HTML table for recent comments
        return `
            <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Recent Comments</h5>
                <a href="#" class="btn btn-sm btn-outline-primary">Manage Comments</a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive scrollable-table">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                    <tr>
                        <th>User</th>
                        <th>Comment</th>
                        <th>Post</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${comments.map(comment => `
                        <tr>
                        <td>
                            ${comment.user && comment.user.profile_pic ? `<img src="${comment.user.profile_pic}" class="table-avatar me-2" alt="User">` : ''}
                            ${comment.user ? `${comment.user.first_name||''} ${comment.user.last_name||''}` : 'Unknown'}
                        </td>
                        <td>${comment.content}</td>
                        <td>
                            ${comment.article ? `<a href="/article/${comment.article.slug}" class="text-decoration-none">${comment.article.title}</a>` : ''}
                        </td>
                        <td>${comment.createdAt.toISOString().slice(0, 10)}</td>
                        <td>
                            <span class="badge ${
                            comment.is_approved  ? 'bg-success' : 'bg-danger'
                            } badge-status">${comment.is_approved  ? 'Approved' : 'Rejected'}</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary"><i class="bi bi-check"></i></button>
                            <button class="btn btn-sm btn-outline-danger"><i class="bi bi-x"></i></button>
                        </td>
                        </tr>
                    `).join('')}
                    </tbody>
                </table>
                </div>
            </div>
            </div>
        `;
    } catch (err) {
    return ``;
    }
}

// Fetch user activity (limit 5)
async function getUserActivity() {
    try {
        const activities = await Activity.findAll({
            include: [
                { model: User, as: 'source', attributes: ['id', 'first_name', 'last_name', 'profile_pic'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Helper to get icon and color by activity type
        function getActivityIcon(type) {
            switch (type) {
            case 'register':
                return { icon: 'bi-person-plus-fill', color: 'text-primary' };
            case 'comment':
                return { icon: 'bi-chat-left-dots-fill', color: 'text-success' };
            case 'publish':
                return { icon: 'bi-pencil-fill', color: 'text-warning' };
            case 'like':
                return { icon: 'bi-heart-fill', color: 'text-danger' };
            case 'unsubscribe':
                return { icon: 'bi-person-dash-fill', color: 'text-secondary' };
            default:
                return { icon: 'bi-info-circle-fill', color: 'text-muted' };
            }
        }

        // Helper to format "time ago"
        function timeAgo(date) {
            const now = new Date();
            const seconds = Math.floor((now - date) / 1000);
            if (seconds < 60) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
            const days = Math.floor(hours / 24);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }

        return `
            <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white border-0">
                <h5 class="mb-0">User Activity</h5>
            </div>
            <div class="card-body">
                <ul class="list-group list-group-flush">
                ${activities.map(act => {
                    const user = act.source;
                    const { icon, color } = getActivityIcon(act.type);
                    let description = act.message || '';
                    // Optionally, you can customize the description here based on act.type
                    return `
                    <li class="list-group-item d-flex align-items-center">
                        <i class="bi ${icon} ${color} activity-icon me-3"></i>
                        <div>
                        <strong>${user ? `${user.first_name||''} ${user.last_name||''}` : 'Unknown'}</strong>
                        ${description ? ` ${description}` : ''}
                        <span class="text-muted">${timeAgo(new Date(act.createdAt))}</span>
                        </div>
                    </li>
                    `;
                }).join('')}
                </ul>
            </div>
            </div>
        `;
    } catch (err) {
    return ``;
    }
}

// Fetch top authors (by article count and views)
async function getTopAuthors() {
    try {
        // Get top authors by article count
        // Get top 4 authors by article count
        const authors = await User.findAll({
            where: { role: { [Op.ne]: 'user' } },
            attributes: [
            'id',
            'profile_pic',
            [fn('CONCAT', col('first_name'), ' ', col('last_name')), 'name'],
            [
                // Subquery to count articles per user
                literal(`(
                SELECT COUNT(*)
                FROM Articles AS a
                WHERE a.userId = User.id
                )`),
                'articleCount'
            ]
            ],
            order: [[literal('articleCount'), 'DESC']],
            limit: 4,
            raw: true
        });

        // Get total views for each author's articles
        const authorIds = authors.map(a => a.id);
        // Get all articles for these authors
        const articles = await Article.findAll({
            attributes: ['id', 'userId'],
            where: { userId: { [Op.in]: authorIds } },
            raw: true
        });

        // Map userId to their article ids
        const authorArticleMap = {};
        articles.forEach(article => {
            if (!authorArticleMap[article.userId]) authorArticleMap[article.userId] = [];
            authorArticleMap[article.userId].push(article.id);
        });

        // Get view counts for all articles
        const allArticleIds = articles.map(a => a.id);
        let views = [];
        if (allArticleIds.length) {
            views = await UserInteraction.findAll({
                attributes: ['article_id', [fn('COUNT', col('id')), 'views']],
                where: {
                    interaction_type: 'view',
                    article_id: { [Op.in]: allArticleIds }
                },
                group: ['article_id'],
                raw: true
            });
        }

        // Map article_id to views
        const viewsMap = {};
        views.forEach(v => {
            viewsMap[v.article_id] = parseInt(v.views, 10);
        });

        // Sum views per author
        const authorViews = {};
        for (const authorId of authorIds) {
            const ids = authorArticleMap[authorId] || [];
            authorViews[authorId] = ids.reduce((sum, aid) => sum + (viewsMap[aid] || 0), 0);
        }

        // Render HTML for top authors
        return `
            <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white border-0">
                <h5 class="mb-0">Top Authors</h5>
            </div>
            <div class="card-body">
                <ul class="list-group list-group-flush">
                ${authors.map(author => `
                    <li class="list-group-item d-flex align-items-center">
                    ${author.profile_pic ? `<img src="${author.profile_pic}" class="table-avatar me-3" alt="Author">` : ''}
                    <div>
                        <strong>${author.name}</strong>
                        <div class="text-muted small">Posts: ${parseInt(author.articleCount) || 0}</div>
                    </div>
                    <span class="badge bg-primary ms-auto">${(authorViews[author.id] || 0).toLocaleString()} Views</span>
                    </li>
                `).join('')}
                </ul>
            </div>
            </div>
        `;
    } catch (err) {
    return ``;
    }
}

// Fetch article status progress (percentages)
async function getArticleStatusProgress() {
    try {
        const total = await Article.count();
        const published = await Article.count({ where: { status: 'Published' } });
        const drafts = await Article.count({ where: { status: 'Draft' } });
        const archived = await Article.count({ where: { status: 'Archived' } });

        // Calculate percentages
        const publishedPercent = total ? Math.round((published / total) * 100) : 0;
        const draftsPercent = total ? Math.round((drafts / total) * 100) : 0;
        const archivedPercent = total ? Math.round((archived / total) * 100) : 0;

        return `
            <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white border-0">
                <h5 class="mb-0">Post Status</h5>
            </div>
            <div class="card-body">
                <div class="mb-2">Published <span class="float-end">${publishedPercent}%</span></div>
                <div class="progress mb-3" style="height: 8px;">
                <div class="progress-bar bg-success" style="width: ${publishedPercent}%"></div>
                </div>
                <div class="mb-2">Drafts <span class="float-end">${draftsPercent}%</span></div>
                <div class="progress mb-3" style="height: 8px;">
                <div class="progress-bar bg-warning" style="width: ${draftsPercent}%"></div>
                </div>
                <div class="mb-2">Archived <span class="float-end">${archivedPercent}%</span></div>
                <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-danger" style="width: ${archivedPercent}%"></div>
                </div>
            </div>
            </div>
        `;
    } catch (err) {
    return ``;
    }
}

async function dashboard(req, res, next) {
    try {
            req.data = await Promise.all([
            getDashboardStats(),
            getRecentArticles(),
            getRecentComments(),
            getUserActivity(),
            getTopAuthors(),
            getArticleStatusProgress(),
            getTrafficChart(),
        ]);

        return next();

    } catch (err) {
        res.status(500).send('Dashboard error');
    }
}

module.exports = {
    getDashboardStats,
    getTrafficChart,
    getRecentArticles,
    getRecentComments,
    getUserActivity,
    getTopAuthors,
    getArticleStatusProgress,
    dashboard
};