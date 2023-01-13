const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'permissions',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      permission_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      guard: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      sequelize,
      tableName: 'permissions',
      timestamps: true,
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
