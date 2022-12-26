module.exports = function(sequelize, DataTypes) {
  return sequelize.define('history_user_order_vga', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    order_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ""
    },
    vga_change: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    vga_owner: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0-chua,1-da doi"
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: "1-THANH TOAN ONLINE BTHUONG,2-THANH TOAN ONLINE SALE,3-DOI MA FREE"
    },
    uid_cms_change: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "id CMS doi ma"
    },
    agent_out_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    cms_out_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    super_admin_out_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    super_agent_out_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    admin_out_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    source: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    is_refund: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    description_request: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    sell_by_admin: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'admin_cms',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'history_user_order_vga',
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
      {
        name: "FK_history_user_order_vga_admin_cms",
        using: "BTREE",
        fields: [
          { name: "sell_by_admin" },
        ]
      },
    ]
  });
};
