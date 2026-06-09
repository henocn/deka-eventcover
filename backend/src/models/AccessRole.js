const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class AccessRole extends Model {
    static associate(models) {
      AccessRole.belongsTo(models.Event, { foreignKey: 'eventId', as: 'event' });
      AccessRole.belongsToMany(models.Album, {
        through: models.AccessRoleAlbum,
        foreignKey: 'accessRoleId',
        otherKey: 'albumId',
        as: 'albums',
      });
    }
  }

  AccessRole.init(
    {
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      publicToken: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'AccessRole',
      tableName: 'access_roles',
    }
  );

  return AccessRole;
};
