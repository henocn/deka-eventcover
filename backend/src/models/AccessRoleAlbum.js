const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class AccessRoleAlbum extends Model {
    static associate(models) {
      AccessRoleAlbum.belongsTo(models.AccessRole, { foreignKey: 'accessRoleId', as: 'accessRole' });
      AccessRoleAlbum.belongsTo(models.Album, { foreignKey: 'albumId', as: 'album' });
    }
  }

  AccessRoleAlbum.init(
    {
      accessRoleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      albumId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'AccessRoleAlbum',
      tableName: 'access_role_albums',
    }
  );

  return AccessRoleAlbum;
};
