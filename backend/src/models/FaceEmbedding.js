const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class FaceEmbedding extends Model {
    static associate(models) {
      FaceEmbedding.belongsTo(models.Event, { foreignKey: 'eventId', as: 'event' });
      FaceEmbedding.belongsTo(models.Album, { foreignKey: 'albumId', as: 'album' });
      FaceEmbedding.belongsTo(models.Media, { foreignKey: 'mediaId', as: 'media' });
    }
  }

  FaceEmbedding.init(
    {
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      albumId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mediaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      embedding: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      boxX: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      boxY: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      boxWidth: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      boxHeight: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'FaceEmbedding',
      tableName: 'face_embeddings',
    }
  );

  return FaceEmbedding;
};
