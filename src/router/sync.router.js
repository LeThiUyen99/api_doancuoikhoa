const router = require('./extensions').Router();
const models = router.models;
const { encodePassword } = require('../lib/password');

// remove after dev
const sync = async (req, res) => {
    // await models.AdminCm.sync({ force: true });

    // await models.AdminHasRole.sync({ force: true });

    // await models.Menu.sync({ force: true });

    // await models.AdminRolePermission.sync({ force: true });

    // await models.PermissionHasMenu.sync({ force: true });

    // await models.Permission.sync({ force: true });

    // await models.RoleHasPermission.sync({ force: true });

    // await models.Unit.sync({ force: true });

    // await models.Role.sync({ force: true });

    // const password = await encodePassword('admin');
    // await models.AdminCm.create({ phone: '0961187214', password, parent_id: 0 });

    res.json('sync');
};

router.getS('/sync', sync, false);
module.exports = router;
