const router = require('./extensions').Router();
const models = router.models;
const { ThrowReturn } = require('./extensions');
const { isEmpty } = require('../lib/validate');
const { Op } = require('sequelize');

// *************************************dev

const create = async (req, res) => {
    const data = req.body;
    const newUnit = await models.Unit.findOrCreate({ where: { name: data.name }, defaults: data });
    if (!newUnit[1]) throw new ThrowReturn('Unit existed');
    return res.sendData(newUnit, 'Create success!');
};

const update = async (req, res) => {
    const { name } = req.body;
    const { unitId } = req.params;
    const updateUnit = await models.Unit.update({ name }, { where: { id: unitId } });
    if (updateUnit[0] === 0) throw new ThrowReturn('Unit not found');
    return res.sendData(null, 'Update success!');
};

const all = async (req, res) => {
    const { currentAdminId } = req;
    const currentAdminRoleSQL = `select roles.level, roles.unit_id from admin_cms inner join admin_has_roles on admin_has_roles.admin_id = admin_cms.id inner join roles on admin_has_roles.role_id = roles.id where admin_cms.id = ${currentAdminId}`
    const currentAdminRole = await db.sequelize.query(currentAdminRoleSQL, { type: db.sequelize.QueryTypes.SELECT });
    if (isEmpty(currentAdminRole[0]?.level)) throw new ThrowReturn("Admin doesn't has any role");
    const currentUnit = currentAdminRole.map((c) => c.unit_id);
    let units = [];
    if (currentUnit.includes(-1)) units = await models.Unit.findAll();
    else units = await models.Unit.findAll({ where: { id: { [Op.or]: currentUnit } } });
    return res.sendData(units);
};

const detail = async (req, res) => {
    const { unitId } = req.params;
    const unit = await models.Unit.findByPk(unitId);
    if (isEmpty(unit)) throw new ThrowReturn('Unit not found');
    return res.sendData(unit);
};

const remove = async (req, res) => {
    const { unitId } = req.params;
    const removeUnit = await models.Unit.destroy({ where: { id: unitId } });
    if (removeUnit === 0) throw new ThrowReturn('Unit not found');
    return res.sendData(null, 'Remove success');
};

router.postS('/create', create, true);
router.postS('/update/:unitId', update, true);
router.getS('/all', all, true);
router.getS('/detail/:unitId', detail, true);
router.getS('/remove/:unitId', remove, true);


// *************************************dev

module.exports = router;
