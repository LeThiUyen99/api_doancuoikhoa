const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  const itineraries = sequelize.define(
    'tour_Itineraries',
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
      day: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Ngày thứ n trong tour'
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      language: {
        type: DataTypes.STRING(100),
        allowNull: true
      }
    },
    {
      sequelize,
      tableName: 'tour_Itineraries',
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


  itineraries.associate = (models) => {
    itineraries.belongsTo(models.Tour, {
      as: 'tour',
      foreignKey: 'tour_id'
    })
  }



  return itineraries
}
