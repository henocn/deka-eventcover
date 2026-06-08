const { sequelize } = require('../config/database');

const models = {
  User: require('./User')(sequelize),
  Event: require('./Event')(sequelize),
  Album: require('./Album')(sequelize),
  Media: require('./Media')(sequelize),
  MediaStat: require('./MediaStat')(sequelize),
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
