'use strict';

const { Article, Subcategory, Hashtag, Section, SectionContent } = require('../models');
const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const subcategories = await Subcategory.findAll();
      const hashtags = await Hashtag.findAll();

      if (!subcategories.length || !hashtags.length) {
        throw new Error('Please seed subcategories and hashtags first.');
      }

      for (let i = 0; i < 2; i++) {
        const title = faker.lorem.sentence();
        const excerpt = faker.lorem.paragraph();
        const status = i % 97 === 0 ? 'draft' : 'published';
        const read_duration = faker.number.int({ min: 2, max: 10 });
        function randomDate(start, end) {
          const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
          return isNaN(date.getTime()) ? null : date;  // Ensure it's valid
        }

        const currentYear = new Date().getFullYear();
        const start = new Date(currentYear, 0, 1);  // Jan 1 of current year
        const end = new Date();  // Now

        const published_at = randomDate(start, end);

        const article = await Article.create({
          title,
          userId: 1,
          featured: i % 100 === 0,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          image: faker.image.url(),
          excerpt,
          status,
          read_duration,
          published_at,
        });

        // Randomly assign 2 subcategories
        const subcategoryIndexes = new Set();
        while (subcategoryIndexes.size < 4) {
          subcategoryIndexes.add(Math.floor(Math.random() * subcategories.length));
        }
        await article.addSubcategories(Array.from(subcategoryIndexes).map(i => subcategories[i]));

        // Randomly assign 3 hashtags
        const hashtagIndexes = new Set();
        while (hashtagIndexes.size < 3) {
          hashtagIndexes.add(Math.floor(Math.random() * hashtags.length));
        }
        await article.addHashtags(Array.from(hashtagIndexes).map(i => hashtags[i]));

        // Add 1-3 sections per article
const sectionCount = faker.number.int({ min: 1, max: 8 });

for (let j = 0; j < sectionCount; j++) {
  const section = await Section.create({
    articleId: article.id,
    order: j + 1,
  });

  let type;

  if (j === 0) {
    // First section must be 'head'
    type = 'head';
  } else if (j === 1 || j === 2) {
    // Second and third sections are 'text'
    type = 'text';
  } else if (j === 3) {
    // Second and third sections are 'text'
    type = 'quote';
  } else if (j === 4) {
    // Second and third sections are 'text'
    type = 'head';
  } else if (j === 5) {
    // Second and third sections are 'text'
    type = 'carousel';
  } else if (j === 6) {
    // Second and third sections are 'text'
    type = 'head';
  } else {
    // Remaining sections are random from ['text', 'image', 'video', 'carousel']
    const types = ['text', 'image', 'video', 'list'];
    type = types[faker.number.int({ min: 0, max: types.length - 1 })];
  }

  let content;

  switch (type) {
    case 'head':
      content = { head: faker.lorem.sentence(), level: faker.number.int({ min: 1, max: 6 }) };
      break;
    case 'quote':
      content = { quote: faker.lorem.sentence(), attribution: faker.person.fullName()  };
      break;
    case 'list':
      content = { items: Array.from({ length: 6 }, () => faker.lorem.sentence()) };
      break;
    case 'text':
      content = { text: faker.lorem.paragraphs(2) };
      break;
    case 'image':
      content = { image: faker.image.url() };
      break;
    case 'video':
      content = { video: faker.internet.url() };
      break;
    case 'carousel':
      content = {
        media: [faker.image.url(), faker.image.url(), faker.image.url(), faker.image.url()],
        captions: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
      };
      break;
  }

  await SectionContent.create({
    sectionId: section.id,
    type,
    content: JSON.stringify(content),
  });
}

      }

      console.log('✅ Seeded 50 articles successfully.');
    } catch (error) {
      console.error('❌ Failed to seed articles:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    // Optional: write code here to undo the seed if needed
  },
};
