const router = require('./extensions').Router();
const models = router.models;
const db = require('./../db');
const { customizeMenu } = require('../lib/formatData');

const menu = async (req, res) => {
    const { currentAdminId } = req;
    const getMenuForAdminSQL = `select menus.* from admin_cms inner join admin_role_permission on admin_cms.id = admin_role_permission.admin_id inner join permissions on permissions.id = admin_role_permission.permission_id inner join permission_has_menu on permission_has_menu.permission_id = permissions.id inner join menus on permission_has_menu.menu_id = menus.id where admin_cms.id = ${currentAdminId} group by menus.id`;
    const menus = await db.sequelize.query(getMenuForAdminSQL, {
        type: db.sequelize.QueryTypes.SELECT,
    });
    const list = customizeMenu(menus);
    return res.sendData(list);
};

router.getS('/menu', menu, true);

module.exports = router;
