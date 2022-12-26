module.exports = function(sequelize, DataTypes) {
  const PermissionHasMenu =  sequelize.define('permission_has_menu', {
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'permission_has_menu',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  PermissionHasMenu.associate = (models) => {
    PermissionHasMenu.belongsTo(models.Menu, { as: "permission_has_menu_menu", foreignKey: "menu_id"});
    PermissionHasMenu.belongsTo(models.Permission, { as: "permission_has_menu_permission", foreignKey: "permission_id"});
  }

  return PermissionHasMenu;
};
