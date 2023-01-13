const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('menus', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    component: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    redirect: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'menus',
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
