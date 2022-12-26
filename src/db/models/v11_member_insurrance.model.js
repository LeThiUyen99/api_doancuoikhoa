/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    let V11MemberInsurrance = sequelize.define('v11_member_insurrance', {
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        insurrance_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

    }, {
        tableName: 'v11_member_insurrance',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        getterMethods: {
            created_at_timestamp() {
                let time = new Date(this.created_at);
                return time.getTime();
            }
        }
    });
    return V11MemberInsurrance;
};
