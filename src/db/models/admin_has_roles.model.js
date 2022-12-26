const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('admin_has_roles', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    admin_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level_super_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'admin_has_roles',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "FK_admin_has_roles_admin_cms",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "admin_id" },
        ]
      },
      {
        name: "FK_admin_has_roles_roles",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
    ]
  });
};
