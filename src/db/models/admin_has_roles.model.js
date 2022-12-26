module.exports = function(sequelize, DataTypes) {
  const AdminHasRole = sequelize.define('admin_has_roles', {
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    admin_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    admin_type: {
      type: DataTypes.STRING(191),
      allowNull: true,
      defaultValue: ""
    },
    parent_id:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level_super_admin_id:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level_admin_id:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level_super_agent_id:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level_agent_id:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type_services:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    level:{
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'admin_has_roles',
    timestamps: false
  });
  AdminHasRole.removeAttribute('id');

  AdminHasRole.associate = (models) => {
    AdminHasRole.belongsTo(models.AdminCm, { as: 'admin_has_role_admin', foreignKey: "admin_id"});
    AdminHasRole.belongsTo(models.Role, { as: 'admin_has_role_role', foreignKey: "role_id"});
  };

  return AdminHasRole;
};
