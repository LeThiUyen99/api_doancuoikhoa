const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  const tours = sequelize.define(
    'tours',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Ngày bắt đầu được phép sử dụng'
      },
      expire_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Ngày hết hạn'
      },
      images: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Hình ảnh chính'
      },
      thumbnail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Hình ảnh nhỏ'
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Trạng thái (1: được bán, 0: Không được bán)'
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Giá cả (0: Giá cả thương lượng)'
      },
      currency: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Đơn vị tiền tệ (vd: VND)'
      },
      sold_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Số lượng đã bán'
      },
      view_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Số lượng người xem tour'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Số lượng được mua tối đa'
      },
      guest_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Số người tối đa trong 1 lượt mua'
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Đường dẫn'
      },
      city_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Thành phố'
      },
      country_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Quốc gia'
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Thể loại'
      }
    },
    {
      sequelize,
      tableName: 'tours',
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

  tours.associate = (models) => {
    tours.hasMany(models.TourImage, {
      as: 'tour_images',
      foreignKey: 'tour_id'
    })

    tours.belongsTo(models.TourCategory, {
      as: 'category',
      foreignKey: 'category_id'
    })

    tours.belongsTo(models.Country, {
      as: 'country',
      foreignKey: 'country_id'
    })

    tours.belongsTo(models.City, {
      as: 'city',
      foreignKey: 'city_id'
    })
  }

  return tours
}
