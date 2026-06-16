const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Media extends Model {
    static associate(models) {
      Media.belongsTo(models.Event, { foreignKey: 'eventId', as: 'event' });
      Media.belongsTo(models.Album, { foreignKey: 'albumId', as: 'album' });
      Media.belongsTo(models.User, { foreignKey: 'uploadedBy', as: 'uploader' });
      Media.hasMany(models.MediaStat, { foreignKey: 'mediaId', as: 'stats' });
      Media.hasMany(models.FaceEmbedding, { foreignKey: 'mediaId', as: 'faceEmbeddings' });
    }
  }

  Media.init(
    {
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      albumId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      originalName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      storagePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      publicUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      sizeBytes: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      width: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      faceAnalysisStatus: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: 'pending',
      },
      faceAnalysisError: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Media',
      tableName: 'media',
    }
  );

  return Media;
};
