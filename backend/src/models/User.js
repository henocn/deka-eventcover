const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Event, { foreignKey: 'createdBy', as: 'events' });
      User.hasMany(models.Media, { foreignKey: 'uploadedBy', as: 'uploads' });
    }

    async verifyPassword(password) {
      return bcrypt.compare(password, this.passwordHash);
    }
  }

  User.init(
    {
      fullName: {
        type: DataTypes.STRING(160),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(180),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: 'admin',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
    }
  );

  return User;
};
