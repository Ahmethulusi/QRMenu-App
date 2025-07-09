// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     /**
//      * Add altering commands here.
//      *
//      * Example:
//      * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
//      */
//   },

//   async down (queryInterface, Sequelize) {
//     /**
//      * Add reverting commands here.
//      *
//      * Example:
//      * await queryInterface.dropTable('users');
//      */
//   }
// };


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('qrcodes', 'is_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('qrcodes', 'is_active');
  }
};
