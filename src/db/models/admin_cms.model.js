const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'admin_cms',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      user_name: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      phone: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: 'phone'
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_active: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    },
    {
      sequelize,
      tableName: 'admin_cms',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{name: 'id'}]
        },
        {
          name: 'phone',
          unique: true,
          using: 'BTREE',
          fields: [{name: 'phone'}]
        }
      ]
    }
  )
}
