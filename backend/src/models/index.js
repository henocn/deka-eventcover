const { sequelize } = require('../config/database');

const models = {
  User: require('./User')(sequelize),
  Event: require('./Event')(sequelize),
  Album: require('./Album')(sequelize),
  AccessRole: require('./AccessRole')(sequelize),
  AccessRoleAlbum: require('./AccessRoleAlbum')(sequelize),
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
