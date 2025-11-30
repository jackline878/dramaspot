const { Celebrity, Insight, Extra } = require('../models');
const { Op, fn, col, where: sqlWhere } = require('sequelize');
const slugify = require('slugify');

function prepareCelebrityProfilePayload(body) {
    const { fullName, nickname } = body;
    const slug = slugify(nickname || fullName, { lower: true, strict: true });
    return {
        fullName: body.fullName?.trim() || '',
        nickname: body.nickname?.trim() || '',
        profilePic: body.profilePic || '',
        coverPic: body.coverPic || '',
        link: body.link || '',
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

// Helper function to determine sort logic
function sortCelebrities(sort) {
    switch (sort) {
        case 'network-desc':
            return ['networth', 'DESC'];
        case 'network-asc':
            return ['networth', 'ASC'];
        case 'name-asc':
            return ['fullName', 'ASC'];
        case 'name-desc':
            return ['fullName', 'DESC'];
        default:
            return ['createdAt', 'DESC'];
    }
}

module.exports = {
    // Create a celebrity
    async create(req, res) {
        try {
            const payload1 = prepareCelebrityProfilePayload(req.body);
            const celebrity = await Celebrity.create(payload1);

            let insights = await Insight.findOne({ where: { celebrityId: celebrity.id } });

            if (!insights) {
                insights = await Insight.create({ celebrityId: celebrity.id });
            }

            const payload = prepareCelebrityPayload(req.body, celebrity.id);
            await insights.update(payload);

            // Return success response with the slug
            const newCelebrity = await Celebrity.findByPk(celebrity.id, {
                attributes: ['slug', 'id']
            });
            res.status(201).json({
                message: 'Celebrity created successfully',
                slug: celebrity.slug,
                id: celebrity.id
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to create celebrity' });
        }
    },


    // Get all celebrities with filters and pagination
    async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 30,
                search = '',
                location = '',
                role = '',
                sort
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            const sortBy = sortCelebrities(sort);

            const where = {};

            // Apply search filters
            if (search) {
                const loweredSearch = search.toLowerCase();
                where[Op.or] = [
                    sqlWhere(fn('LOWER', col('fullName')), {
                        [Op.like]: `%${loweredSearch}%`,
                    }),
                    sqlWhere(fn('LOWER', col('nickname')), {
                        [Op.like]: `%${loweredSearch}%`,
                    }),
                ];
            }

            // Apply location filter
            if (location) {
                const loweredLocation = location.toLowerCase();
                where[Op.and] = where[Op.and] || [];
                where[Op.and].push(
                    sqlWhere(fn('LOWER', col('nationality')), {
                        [Op.like]: `%${loweredLocation}%`,
                    })
                );
            }

            // Apply role filter
            if (role) {
                const loweredRole = role.toLowerCase();
                where[Op.and] = where[Op.and] || [];
                where[Op.and].push(
                    sqlWhere(fn('LOWER', col('roles')), {
                        [Op.like]: `%${loweredRole}%`,
                    })
                );
            }


            const { count, rows } = await Celebrity.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                order: [sortBy],
                include: [Insight, Extra]
            });

            const totalPages = Math.ceil(count / limit);

            res.json({
                total: count,
                totalPages,
                page: parseInt(page),
                perPage: parseInt(limit),
                data: rows
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch celebrities' });
        }
    },

    async getBySlug(req, res) {
        try {

            const celebrity = await Celebrity.findOne({
                where: { slug: req.params.slug },
                include: [Insight]
            });

            if (!celebrity) {
                return res.status(404).json({ error: 'Celebrity not found' });
            }

            const data = celebrity.toJSON();

            // Parse possible JSON fields in main Celebrity
            for (const key in data) {
                if (typeof data[key] === 'string') {
                    try {
                        const parsed = JSON.parse(data[key]);
                        if (typeof parsed === 'object' || Array.isArray(parsed)) {
                            data[key] = parsed;
                        }
                    } catch (_) {
                        // Not JSON, skip
                    }
                }
            }

            // Flatten first Insight if it exists
            const insight = Array.isArray(data.Insights) ? data.Insights[0] : null;
            if (insight) {
                for (const key in insight) {
                    if (typeof insight[key] === 'string') {
                        try {
                            const parsed = JSON.parse(insight[key]);
                            if (typeof parsed === 'object' || Array.isArray(parsed)) {
                                data[key] = parsed;
                            } else {
                                data[key] = insight[key];
                            }
                        } catch (_) {
                            data[key] = insight[key]; // leave as is
                        }
                    } else {
                        data[key] = insight[key];
                    }
                }
            }

            delete data.Insights;

            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch celebrity' });
        }
    },

    // Update a celebrity by slug
    async updateBySlug(req, res) {
        try {

            console.log(req.body);
            const payload1 = prepareCelebrityProfilePayload(req.body);

            const celebrity = await Celebrity.findOne({ where: { slug: req.params.slug } });
            if (!celebrity) {
                return res.status(404).json({ error: 'Celebrity not found' });
            }

            await celebrity.update(payload1);

            let insights = await Insight.findOne({ where: { celebrityId: celebrity.id } });

            if (!insights) {
                insights = await Insight.create({ celebrityId: celebrity.id });
            }

            const payload = prepareCelebrityPayload(req.body, celebrity.id);
            await insights.update(payload);
            res.json(celebrity);
        } catch (err) {
            res.status(500).json({ error: 'Failed to update celebrity' });
        }
    },

    // Delete a celebrity by slug
    async deleteBySlug(req, res) {
        try {
            const deleted = await Celebrity.destroy({ where: { slug: req.params.slug } });
            if (!deleted) {
                return res.status(404).json({ error: 'Celebrity not found' });
            }

            res.json({ message: 'Celebrity deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete celebrity' });
        }
    }
};
