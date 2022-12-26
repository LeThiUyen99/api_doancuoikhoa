const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'tour_requestes',
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
        comment: 'Số người tham gia tour'
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '0: tour cụ thể, 1: tour mong muốn '
      },
      type_hotel: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Loại khách sạn (1-5 sao)'
      },
      min_price: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Giá tối thiểu'
      },
      max_price: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Giá tối đa'
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Ngày bắt đầu tour'
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Ngày kết thúc tour'
      }
    },
    {
      sequelize,
      tableName: 'tour_requestes',
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
}
