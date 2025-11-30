'use strict';

const { Article, Subcategory, Hashtag, Section, SectionContent } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const subcategories = await Subcategory.findAll();
      const hashtags = await Hashtag.findAll();

      if (!subcategories.length || !hashtags.length) {
        throw new Error('Please seed subcategories and hashtags first.');
      }

      // ✅ REAL ARTICLE DATA
      const title = "The Rise of Kenyan Creators in the Digital Era";
      const excerpt = "Kenya's digital landscape is booming. From YouTubers to tech bloggers, creators are making a global impact.";
      const status = "published";
      const read_duration = 5;
      const published_at = new Date();

      const article = await Article.create({
        title,
        userId: 1,
        featured: false,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        image: null,
        excerpt,
        status,
        read_duration,
        published_at,
      });

      // ✅ Connect to some categories & tags
      const subcategoryIds = subcategories.slice(0, 2).map(s => s.id);
      const hashtagIds = hashtags.slice(0, 3).map(h => h.id);
      await article.addSubcategories(subcategoryIds);
      await article.addHashtags(hashtagIds);

      // ✅ Full-length sections with heads first
      const sections = [
        {
          head: "Kenya’s Content Revolution",
          content: {
            type: 'text',
            text: `In recent years, Kenya has experienced a significant transformation in digital content creation. The rise of social media platforms such as YouTube, TikTok, and Instagram has empowered ordinary Kenyans to become influencers, educators, entertainers, and entrepreneurs. This cultural shift has brought untold opportunities, giving voices to the youth who were once invisible in mainstream media.`
          }
        },
        {
          head: "Top Content Niches Dominating the Kenyan Scene",
          content: {
            type: 'list',
            items: [
              "Tech bloggers offering smartphone reviews and tutorials",
              "Lifestyle influencers showcasing travel, beauty, and daily life",
              "Comedians creating relatable content that resonates across East Africa",
              "Financial educators simplifying investment and business topics"
            ]
          }
        },
        {
          head: "Why Digital Media Matters",
          content: {
            type: 'quote',
            quote: "Digital media is the heartbeat of modern youth expression in Kenya. It's no longer just entertainment—it's empowerment.",
            attribution: "Jane Wambui, Media Analyst"
          }
        },
        {
          head: "Opportunities for Youth",
          content: {
            type: 'text',
            text: `With increased internet penetration and cheaper smartphones, Kenya’s youth are tapping into the global digital economy. From earning through affiliate marketing to landing sponsorships and brand deals, creators are building real businesses. Many have turned full-time content creation into a career that supports families and educates thousands.`
          }
        },
        {
          head: "The Road Ahead",
          content: {
            type: 'text',
            text: `While challenges such as limited access to monetization platforms and copyright concerns still exist, Kenya's creative class is growing rapidly. The future promises more platforms, more funding, and even government support. The momentum is unstoppable.`
          }
        }
      ];

      // Insert sections with head + content
      for (let i = 0; i < sections.length; i++) {
        const { head, content } = sections[i];

        const section = await Section.create({ articleId: article.id, order: i + 1 });

        if(head){
        await SectionContent.create({
          sectionId: section.id,
          type: 'head',
          content: JSON.stringify({ head, level: 2 })
        });
      }

        await SectionContent.create({
          sectionId: section.id,
          type: content.type,
          content: JSON.stringify(content)
        });
      }

      console.log('✅ Real article with head-first sections seeded successfully.');
    } catch (error) {
      console.error('❌ Failed to seed article:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await Article.destroy({ where: {}, truncate: true, cascade: true });
    await Section.destroy({ where: {}, truncate: true, cascade: true });
    await SectionContent.destroy({ where: {}, truncate: true, cascade: true });
  }
};
