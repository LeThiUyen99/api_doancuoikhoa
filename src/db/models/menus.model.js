module.exports = function(sequelize, DataTypes) {
  const Menu = sequelize.define('menus', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(191),
      allowNull: false,
      defaultValue: ""
    },
    path: {
      type: DataTypes.STRING(191),
      allowNull: false,
      defaultValue: ""
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ""
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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

  Menu.associate = (models) => {
    Menu.hasMany(models.PermissionHasMenu, { as: 'menu_permission_has_menu', foreignKey: "menu_id"});
  };

  return Menu;
};
