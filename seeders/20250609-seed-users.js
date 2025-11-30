'use strict';

const { faker } = require('@faker-js/faker');

const slugify = require('slugify');

module.exports = {
    async up(queryInterface, Sequelize) {
        const celebrities = [];

        for (let i = 0; i < 200; i++) {
            celebrities.push({
                fullName: faker.person.fullName(),
                nickname: faker.person.firstName(),
                profilePic: faker.image.url({ width: 400, height: 400, category: 'people', https: true }),
                coverPic: faker.image.url({ width: 800, height: 600, category: 'people', https: true }),
                dateOfBirth: faker.date.birthdate({ min: 1960, max: 2005, mode: 'year' }),
                placeOfBirth: faker.location.city(),
                networth: faker.commerce.price(100000, 10000000, 2),
                nationality: faker.location.country(),
                slug: slugify(faker.person.firstName(), { lower: true, strict: true }),
                roles: JSON.stringify([
                    faker.person.jobType(),
                    faker.person.jobType()
                ]),
                careerBackground: faker.lorem.paragraphs(2),
                bio: faker.lorem.paragraphs(3),
                relationshipStatus: faker.helpers.arrayElement([
                    'Single', 'Married', 'Divorced', 'In a Relationship'
                ]),
                familyBackground: faker.lorem.sentences(3),
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await queryInterface.bulkInsert('Celebrities', celebrities, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Celebrities', null, {});
    }
};
