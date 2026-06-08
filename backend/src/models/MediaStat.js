const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class MediaStat extends Model {
    static associate(models) {
      MediaStat.belongsTo(models.Event, { foreignKey: 'eventId', as: 'event' });
      MediaStat.belongsTo(models.Album, { foreignKey: 'albumId', as: 'album' });
      MediaStat.belongsTo(models.Media, { foreignKey: 'mediaId', as: 'media' });
    }
  }

  MediaStat.init(
    {
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      albumId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      mediaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      ipHash: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'MediaStat',
      tableName: 'media_stats',
      updatedAt: false,
    }
  );

  return MediaStat;
};
