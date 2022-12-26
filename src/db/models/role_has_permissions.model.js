const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'role_has_permissions',
    {
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      tableName: 'role_has_permissions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  )
}
