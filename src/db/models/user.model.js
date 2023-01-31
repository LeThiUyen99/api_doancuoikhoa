const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'user',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      username: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      phone: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      create_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      update_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      sequelize,
      tableName: 'user',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{name: 'id'}]
        }
      ]
    }
  )
}
