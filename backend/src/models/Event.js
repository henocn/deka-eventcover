const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Event extends Model {
    static associate(models) {
      Event.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
      Event.hasMany(models.Album, { foreignKey: 'eventId', as: 'albums' });
      Event.hasMany(models.Media, { foreignKey: 'eventId', as: 'media' });
      Event.hasMany(models.MediaStat, { foreignKey: 'eventId', as: 'stats' });
      Event.hasMany(models.AccessRole, { foreignKey: 'eventId', as: 'accessRoles' });
      Event.belongsTo(models.Media, { foreignKey: 'coverMediaId', as: 'coverMedia' });
    }
  }

  Event.init(
    {
      title: {
        type: DataTypes.STRING(180),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(180),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(180),
        allowNull: true,
      },
      startsAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endsAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      accessCode: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      coverMediaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Event',
      tableName: 'events',
    }
  );

  return Event;
};
