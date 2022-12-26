const { Op } = require('sequelize');
const { models } = require('../db');
const db = require('../db');
const { queryInArray } = require('./formatData');

const getAllChildrenAdmin = async (currentAdminId, adminPropsWillTake) => {
    let allAdmin = [];
    // const getAdminsSQL = `select ${adminPropsWillTake} from admin_cms where parent_id=${currentAdminId}`;
    // let admins = (await db.sequelize.query(getAdminsSQL, { type: db.sequelize.QueryTypes.SELECT })) || [];
    // console.log(".............................",adminPropsWillTake)
    let admins = await models.AdminCm.findAll({where: {parent_id: currentAdminId}, raw: true, attributes: adminPropsWillTake})
    admins = await getUnitRolePermission(admins);
    allAdmin = admins.concat(await getChildren(admins, adminPropsWillTake));
    return allAdmin;
};

const getChildren = async (admins, adminPropsWillTake) => {
    return new Promise(async (resolve) => {
        const query = admins.reduce((a, c) => [...a, c.id], []);
        // const getAdminsSQL = `select ${adminPropsWillTake} from admin_cms where parent_id ${queryInArray(query)}`;
        // let children = await db.sequelize.query(getAdminsSQL, { type: db.sequelize.QueryTypes.SELECT });
        let children = await models.AdminCm.findAll({where: {parent_id: {[Op.or]: query}}, raw: true, attributes: adminPropsWillTake})
        if (children && children.length !== 0) {
            const child = await getChildren(children, adminPropsWillTake);
            let returnChild = [...children, ...child];
            returnChild = await getUnitRolePermission(returnChild);
            resolve(returnChild);
        }
        children = await getUnitRolePermission(children);
        resolve(children);
    });
};

const getUnitRolePermission = async (admins) => {
    const admin_id = admins.map((a) => a.id);
    const role_URP_SQL = `select roles.*, admin_role_permission.admin_id from admin_role_permission inner join roles on admin_role_permission.role_id = roles.id where admin_role_permission.admin_id ${queryInArray(
        admin_id
    )} group by admin_role_permission.admin_id, roles.id`;
    const permission_URP_SQL = `select permissions.*, admin_role_permission.admin_id from admin_role_permission inner join permissions on admin_role_permission.permission_id = permissions.id where admin_role_permission.admin_id ${queryInArray(
        admin_id
    )} group by admin_role_permission.admin_id, permissions.id`;
    const unit_URP_SQL = `select units.*, admin_role_permission.admin_id from admin_role_permission inner join roles on admin_role_permission.role_id = roles.id inner join units on units.id = roles.unit_id where admin_role_permission.admin_id ${queryInArray(
        admin_id
    )} group by admin_role_permission.admin_id, roles.unit_id`;
    const roleURP = (await db.sequelize.query(role_URP_SQL, { type: db.sequelize.QueryTypes.SELECT })) || [];
    const permissionURP = (await db.sequelize.query(permission_URP_SQL, { type: db.sequelize.QueryTypes.SELECT })) || [];
    const unitURP = (await db.sequelize.query(unit_URP_SQL, { type: db.sequelize.QueryTypes.SELECT })) || [];

    admins = admins.reduce((a, c) => {
        const r = [
            ...a,
            {
                ...c,
                roles: roleURP.reduce((a1, c1) => {
                    if (c1.admin_id === c.id) {
                        return [...a1, c1];
                    }
                    return a1;
                }, []),
            },
        ];
        return r;
    }, []);
    admins = admins.reduce((a, c) => {
        const p = [
            ...a,
            {
                ...c,
                permissions: permissionURP.reduce((a1, c1) => {
                    if (c1.admin_id === c.id) {
                        return [...a1, c1];
                    }
                    return a1;
                }, []),
            },
        ];
        return p;
    }, []);
    admins = admins.reduce((a, c) => {
        const u = [
            ...a,
            {
                ...c,
                units: unitURP.reduce((a1, c1) => {
                    if (c1.admin_id === c.id) {
                        return [...a1, c1];
                    }
                    return a1;
                }, []),
            },
        ];
        return u;
    }, []);

    return admins;
};

const getAllValidateChildrenAdmin = async (currentAdminId) => {
    let allAdmin = [];
    // const getAdminsSQL = `select admin_cms.id from admin_cms where parent_id=${currentAdminId}`;
    // let admins = (await db.sequelize.query(getAdminsSQL, { type: db.sequelize.QueryTypes.SELECT })) || [];
    let admins = await models.AdminCm.findAll({where: {parent_id: currentAdminId}, raw: true, attributes: ['id']})
    allAdmin = admins.concat(await getValidateChildren(admins));
    return allAdmin;
};

const getValidateChildren = async (admins) => {
    return new Promise(async (resolve) => {
        const query = admins.reduce((a, c) => [...a, c.id], []);
        // const getAdminsSQL = `select admin_cms.id from admin_cms where parent_id ${queryInArray(query)}`;
        // let children = await db.sequelize.query(getAdminsSQL, { type: db.sequelize.QueryTypes.SELECT });
        let children = await models.AdminCm.findAll({where: {parent_id: {[Op.or]: query}}, raw: true, attributes: ['id']})
        if (children && children.length !== 0) {
            const child = await getValidateChildren(children);
            let returnChild = [...children, ...child];
            returnChild = await getUnitRolePermission(returnChild);
            resolve(returnChild);
        }
        children = await getUnitRolePermission(children);
        resolve(children);
    });
};

module.exports = { getAllChildrenAdmin, getAllValidateChildrenAdmin, getUnitRolePermission };
