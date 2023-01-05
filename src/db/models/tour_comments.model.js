const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  const comments = sequelize.define(
    'tour_comments',
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
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Đánh giá sao (1-5)'
      },
      customer_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      customer_email: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      sequelize,
      tableName: 'tour_comments',
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
  comments.associate = (models) => {
    comments.belongsTo(models.Tour, {
      as: 'tour',
      foreignKey: 'tour_id'
    })
  }
  return comments
}
