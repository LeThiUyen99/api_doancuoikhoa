const router = require('./extensions').Router()
const {models} = require('./../db')
const db = require('./../db')

const all = async (req, res) => {
    const {currentAdminId} = req
    const getAdminPermission = `select permissions.* from admin_cms inner join admin_has_roles on admin_cms.id = admin_has_roles.admin_id inner join admin_role_permission on admin_role_permission.role_id = admin_has_roles.role_id inner join permissions on admin_role_permission.permission_id = permissions.id where admin_cms.id =${currentAdminId} group by permissions.id`
    const permissions = await db.sequelize.query(getAdminPermission, {type: db.sequelize.QueryTypes.SELECT})
    return res.sendData(permissions)
}

router.getS('/all', all, true)


// ************************************************ dev
const addPermissionHasMenu = async (req, res) => {
    const {permission_id, menu_id} = req.body
    for (const m of menu_id) {
        models.PermissionHasMenu.findOrCreate({
            where: {menu_id: m, permission_id},
            defaults: {menu_id: m, permission_id},
        })
    }
    return res.sendData(null, 'Success!')
}

router.postS('/add-permission-has-menu', addPermissionHasMenu, false)
// ************************************************ dev

module.exports = router
