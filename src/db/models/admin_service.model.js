const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('admin_service', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    admin_cms_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    type_services: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    super_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    super_agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_active: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    discount_by_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'admin_service',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
