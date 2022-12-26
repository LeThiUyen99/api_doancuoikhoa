module.exports = function(sequelize, DataTypes) {
  const Permission = sequelize.define('permissions', {
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
    descriptions: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
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

  Permission.associate = (models) => {
    Permission.hasMany(models.PermissionHasMenu, { as: "permission_permission_has_menu", foreignKey: "permission_id"});
    Permission.hasMany(models.RoleHasPermission, { as: "permission_role_has_permissions", foreignKey: "permission_id"});
    Permission.hasMany(models.AdminRolePermission, { as: "permission_admin_role_permissions", foreignKey: "permission_id"});
  }

  return Permission;
};
