module.exports = function(sequelize, DataTypes) {
  const AdminCm = sequelize.define('admin_cms', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "phone"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_active: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    discount:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    type_services:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    level:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    super_admin_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    admin_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    super_agent_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    agent_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'admin_cms',
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
      {
        name: "phone",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "phone" },
        ]
      },
    ]
  });

  AdminCm.associate = (models) => {
    AdminCm.belongsToMany(models.Role, { as: 'admin_roles', through: models.AdminHasRole, foreignKey: "admin_id", otherKey: "role_id" });
    AdminCm.belongsToMany(models.Permission, { as: 'admin_permissions', through: models.AdminRolePermission, foreignKey: "admin_id", otherKey: "permission_id" });
    AdminCm.hasMany(models.AdminHasRole, { as: "admin_admin_has_roles", foreignKey: "admin_id"});
    AdminCm.hasMany(models.Role, { as: 'admin_role', foreignKey: "unit_id" });
  };


  return AdminCm;
};
