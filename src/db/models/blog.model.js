const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  const blog = sequelize.define(
    'blog',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      images: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      active: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      auth_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      create_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      update_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      sequelize,
      tableName: 'blog',
      timestamps: false,
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

  blog.associate = (models) => {
    blog.belongsTo(models.AdminCm, {
      as: 'accounts',
      foreignKey: 'auth_id'
    })
  }
  return blog
}
