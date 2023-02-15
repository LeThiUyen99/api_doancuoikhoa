const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Message =  sequelize.define('message', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "0:Gửi từ Admin, 1: Gửi từ user"
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    room: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'message',
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

  Message.associate = (models) => {
    Message.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'room'
    })
  }

  return Message
};
