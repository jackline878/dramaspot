'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Activities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // Default value for `isRead`
      },
      // Foreign keys for associations
      user_id: {
        type: Sequelize.UUID,
        onDelete: 'CASCADE', // Delete Activities if the user is deleted
      },
      target_id: {
        type: Sequelize.UUID,
      },
      item_id: {
        type: Sequelize.INTEGER, // This can be used to reference the item related to the Activity
      },
      // Timestamps for created and updated records
      // These fields will automatically be managed by Sequelize
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'), // Automatically set the creation time
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'), // Automatically set the update time
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Activities');
  },
};
