const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Album extends Model {
    static associate(models) {
      Album.belongsTo(models.Event, { foreignKey: 'eventId', as: 'event' });
      Album.hasMany(models.Media, { foreignKey: 'albumId', as: 'media' });
      Album.hasMany(models.MediaStat, { foreignKey: 'albumId', as: 'stats' });
      Album.belongsTo(models.Media, { foreignKey: 'coverMediaId', as: 'coverMedia' });
      Album.belongsToMany(models.AccessRole, {
        through: models.AccessRoleAlbum,
        foreignKey: 'albumId',
        otherKey: 'accessRoleId',
        as: 'accessRoles',
      });
    }
  }

  Album.init(
    {
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(180),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(180),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      coverMediaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Album',
      tableName: 'albums',
    }
  );

  return Album;
};
