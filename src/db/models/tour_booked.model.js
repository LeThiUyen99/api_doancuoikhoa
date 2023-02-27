const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  const tour_booked = sequelize.define(
    'tour_booked',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      tour_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      customer_name: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      customer_phone: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      customer_email: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      guest_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Số khách hàng'
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Giá tour'
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Thời gian bắt đầu (Nếu là tour khách hàng tự yêu cầu)'
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Thời gian kết thúc (Nếu là tour khách hàng tự yêu cầu)'
      },
      active: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      active_comment: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Trạng thái (0: chưa bình luận, 1: đã bình luận)'
      }
    },
    {
      sequelize,
      tableName: 'tour_booked',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{name: 'id'}]
        }
      ]
    }
  )
  tour_booked.associate = (models) => {
    tour_booked.belongsTo(models.Tour, {
      as: 'tour',
      foreignKey: 'tour_id'
    })
  }
  return tour_booked
}
