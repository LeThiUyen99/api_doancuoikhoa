const router = require('./extensions').Router();
const models = router.models;
const { Op } = require('sequelize');
const { isEmpty } = require('../lib/validate');
const { ThrowReturn } = require('./extensions');

const all = async (req, res) => {
    const { currentAdminId,currentAdmin } = req;
    // const currentAdminRoleSQL = `select roles.level, roles.unit_id from admin_cms inner join admin_has_roles on admin_has_roles.admin_id = admin_cms.id inner join roles on admin_has_roles.role_id = roles.id where admin_cms.id = ${currentAdminId}`
    // const currentAdminRole = await db.sequelize.query(currentAdminRoleSQL, { type: db.sequelize.QueryTypes.SELECT });
    const currentAdminRole = await models.AdminCm.findAll({
        where: {id: currentAdminId},
        attributes: ["admin_roles.level"],
        include: {model: models.Role, as: 'admin_roles'},
        raw:true
    })
    if (isEmpty(currentAdminRole[0].level)) throw new ThrowReturn("Admin doesn't has any role")
    const currentUnit = currentAdminRole.map((c) => c.unit_id)
    let roles = []
    if (currentUnit.includes(-1) || currentUnit.includes(0)) {
        roles = await models.Role.findAll()
    } else {
        if (currentAdmin.level > 2) {
            for (const c of currentAdminRole) {
                const role = await models.Role.findAll({
                    where: {level: {[Op.gt]: c.level}, unit_id: c.unit_id},
                    raw: true,
                })
                roles = [...roles, ...role]
            }
        } else {
            for (const c of currentAdminRole) {
                const role = await models.Role.findAll({where: {level: {[Op.gte]: c.level}}, raw: true})
                roles = [...roles, ...role]
            }
        }
    }
    return res.sendData(roles);
};

const changePermissionByRole = async (req, res) => {
    const { role_id } = req.params;
    const { permission_id } = req.body;

    const roleHasPermissions = await models.RoleHasPermission.findAll({ where: { role_id }, raw: true });
    const roleHasPermissionId = roleHasPermissions.map((c) => c.permission_id);
    const removePermission = roleHasPermissionId.filter((c) => {
        if (!permission_id.includes(c)) return c;
    });

    for (const p of permission_id) {
        if (!roleHasPermissionId.includes(p)) {
            await models.RoleHasPermission.findOrCreate({
              where: { role_id, permission_id: p },
              defaults: { role_id, permission_id: p },
            });
            // const getAdminHasRoleSQL = `select admin_cms.* from admin_cms inner join admin_has_roles on admin_has_roles.admin_id = admin_cms.id where admin_has_roles.role_id = ${role_id}`
            // const admins = await db.sequelize.query(getAdminHasRoleSQL, {type: db.sequelize.QueryTypes.SELECT})
            const admins = await models.AdminCm.findAll({
                include: {model: models.AdminHasRole, as: 'admin_admin_has_roles', where: {role_id}},
            })
            if (!isEmpty(admins)) {
                for (const a of admins) {
                    await models.AdminRolePermission.findOrCreate({
                        where: {role_id, permission_id: p, admin_id: a.id},
                        defaults: {role_id, permission_id: p, admin_id: a.id},
                    })
                }
            }
        }
    }

    if (!removePermission.includes(undefined) && !isEmpty(removePermission)) {
        await models.RoleHasPermission.destroy({where: {role_id, permission_id: {[Op.or]: removePermission}}})
        await models.AdminRolePermission.destroy({where: {role_id, permission_id: {[Op.or]: removePermission}}})
    }
    return res.sendData(null, 'Change role success!')
}

const getPermissionByRole = async (req, res) => {
    const {role_id} = req.body
    const roleHasPermission = await models.RoleHasPermission.findAll({
      where: { role_id: role_id },
      attributes: [
        "role_id",
        "role_has_permission_permission.id",
        "role_has_permission_permission.permission_name",
        "role_has_permission_permission.descriptions",
        "role_has_permission_permission.created_at",
        "role_has_permission_permission.updated_at"
      ],
      include: {
        model: models.Permission,
        as: "role_has_permission_permission",
        attributes: [], 
      },
      raw: true,
    });
    return res.sendData(roleHasPermission)
}

router.getS('/all', all, true)
router.postS('/change-permission-by-role/:role_id', changePermissionByRole, true, [])
router.postS('/permission-by-role', getPermissionByRole, true, [])

// *************************************dev
const create = async (req, res) => {
    const data = req.body
    console.log(data)
    const newRole = await models.Role.findOrCreate({
      where: { name: data.name, unit_id: data.unit_id },
      defaults: data,
    });
    if (!newRole[1]) throw new ThrowReturn('Role existed')
    return res.sendData(null,"Create success!");
}
router.postS('/create', create, false)
// *************************************dev

module.exports = router
