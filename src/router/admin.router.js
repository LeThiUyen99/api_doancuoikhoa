const router = require('./extensions').Router()
const models = router.models
let fetch = require('node-fetch')

const {getAllChildrenAdmin, getUnitRolePermission} = require('../lib/getAllAdmin')
const {encodePassword, comparePassword} = require('../lib/password')
const {getTotalPage, customizeMenu} = require('../lib/formatData')
const {generateToken, generateRefreshToken, decodeToken} = require('../lib/token')
const {isEmpty} = require('../lib/validate')
const {pluck} = require('../utils/collection')
const {ThrowReturn} = require('./extensions')
const {OTP_URL} = require('../../config/setting')
const {Op} = require('sequelize')
let db = require('./../db/index')
let redispool = require('../utils/redispool')
const {filterAdmin} = require('../lib/filter')
const {hashPassword} = require("mysql/lib/protocol/Auth");

const levelAdmin = {
    1: 'boss',
    2: 'super_admin_id',
    3: 'admin_id',
    4: 'super_agent_id',
    5: 'agent_id',
    6: 'client_id',
}

// const adminPropsWillTake =
//     'admin_cms.level, admin_cms.super_admin_id, admin_cms.admin_id, admin_cms.super_agent_id, admin_cms.agent_id, admin_cms.id, admin_cms.discount, admin_cms.discount_by_id, admin_cms.parent_id, admin_cms.user_name, admin_cms.phone, admin_cms.is_active, admin_cms.created_at, admin_cms.updated_at'

const adminPropsWillTake = ['level', 'super_admin_id', 'admin_id', 'super_agent_id', 'agent_id', 'id', 'discount', 'discount_by_id', 'parent_id', 'user_name', "created_at", "updated_at"]

const create = async (req, res) => {
    console.log('req.body.........................', req.body)
    const {currentAdmin} = req

    let data = req.body
    // validate input data
    if (isEmpty(data.phone) || isEmpty(data.roles)) throw new ThrowReturn('Invalid input data')
    // create admin
    let admin = {
        user_name: data.user_name,
        phone: data.phone,
        is_active: data.is_active || 1,
        parent_id: currentAdmin.id,
    }
    const newAdmin = await models.AdminCm.findOrCreate({where: {phone: data.phone}, defaults: admin, raw: true})
    if (!newAdmin[1]) throw new ThrowReturn('Phone existed')
    // create role
    for (const r of data.roles) {
        const inputRole = await models.Role.findByPk(r.role_id, {raw: true})
        // validate input data
        let parentAdmin = []
        if (!isEmpty(r.parent_id)) parentAdmin = await models.AdminCm.findOne({where: {id: r.parent_id}, raw: true})
        else parentAdmin = currentAdmin
        console.log(inputRole, parentAdmin)
        if (inputRole.level <= parentAdmin.level) throw new ThrowReturn('Invalid admin level')
        // create role
        await models.AdminHasRole.create({role_id: r.role_id, admin_id: newAdmin[0].id})
        // create type service
        let typeService = {
            admin_cms_id: newAdmin[0].id,
            type_services: r.type_services || parentAdmin.type_services,
            level: inputRole.level,
            parent_id: r.parent_id || currentAdmin.id,
            super_admin_id: r.super_admin_id || parentAdmin.super_admin_id,
            admin_id: r.admin_id || parentAdmin.admin_id,
            super_agent_id: r.super_agent_id || parentAdmin.super_agent_id,
            agent_id: r.agent_id || parentAdmin.agent_id,
            discount: r.discount,
            discount_by_id: r.discount_by_id || currentAdmin.id,
        }
        typeService[levelAdmin[parentAdmin.level]] = parentAdmin.id
        await models.AdminService.create(typeService)
        // create role by admin
        const initPermission = await models.RoleHasPermission.findAll({where: {role_id: r.role_id}, raw: true})

        for (let p of initPermission) {
            await models.AdminRolePermission.findOrCreate({
                where: {
                    admin_id: newAdmin[0].id,
                    role_id: r.role_id,
                    permission_id: p.permission_id,
                },
                defaults: {
                    admin_id: newAdmin[0].id,
                    role_id: r.role_id,
                    permission_id: p.permission_id,
                },
            })

        }

    }
    return res.sendData(null, 'Create success!')
}

const updateAdminRole = async (req, res) => {
    const {currentAdmin} = req
    const {admin_id} = req.params
    let data = req.body

    // remove role,permission,type service
    await models.AdminHasRole.destroy({where: {admin_id}})
    await models.AdminRolePermission.destroy({where: {admin_id}})
    await models.AdminService.destroy({where: {admin_cms_id: admin_id}})

    // validate input data
    if (isEmpty(data.phone) || isEmpty(data.roles)) throw new ThrowReturn('Invalid input data')
    // create role
    for (const r of data.roles) {
        const inputRole = await models.Role.findByPk(r.role_id, {raw: true})
        // validate input data
        let parentAdmin = []

        if (!isEmpty(r.parent_id)) parentAdmin = await models.AdminCm.findOne({where: {id: r.parent_id}, raw: true})
        else parentAdmin = currentAdmin
        if (inputRole.level <= parentAdmin.level) throw new ThrowReturn('Invalid admin level')

        // create role
        await models.AdminHasRole.create({role_id: r.role_id, admin_id: admin_id})
        // create type service
        let typeService = {
            admin_cms_id: admin_id,
            type_services: r.type_services || parentAdmin.type_services,
            level: inputRole.level,
            parent_id: r.parent_id || currentAdmin.id,
            super_admin_id: r.super_admin_id || parentAdmin.super_admin_id,
            admin_id: r.admin_id || parentAdmin.admin_id,
            super_agent_id: r.super_agent_id || parentAdmin.super_agent_id,
            agent_id: r.agent_id || parentAdmin.agent_id,
            discount: r.discount,
            discount_by_id: r.discount_by_id || currentAdmin.id,
        }
        typeService[levelAdmin[parentAdmin.level]] = parentAdmin.id
        await models.AdminService.create(typeService)
        // create role by admin
        const initPermission = await models.RoleHasPermission.findAll({where: {role_id: r.role_id}, raw: true})

        for (let p of initPermission) {
            await models.AdminRolePermission.findOrCreate({
                where: {
                    admin_id: admin_id,
                    role_id: r.role_id,
                    permission_id: p.permission_id,
                },
                defaults: {
                    admin_id: admin_id,
                    role_id: r.role_id,
                    permission_id: p.permission_id,
                },
            })

        }

    }
    return res.sendData(null, 'Update success!')
}

const changeRole = async (req, res) => {
    const {currentAdminId, currentAdmin} = req
    const {admin_id} = req.params
    // const {is_active, user_name, discount, phone, discount_by_id} = req.body.admin
    const {role_id, admin} = req.body

    if (!isEmpty(admin.phone)) {
        const phoneExisted = await models.AdminCm.findAll({where: {phone: admin.phone}, raw: true})
        if (!isEmpty(phoneExisted)) throw new ThrowReturn('Phone existed')
    }
    // modify input data
    const data = {
        is_active: admin.is_active,
        user_name: admin.user_name,
        discount: admin.discount,
        phone: admin.phone,
        discount_by_id: admin.discount_by_id,
        parent_id: admin.parent_id,
        level: admin.level,
        type_services: admin.type_services,
        super_admin_id: admin.super_admin_id,
        admin_id: admin.admin_id,
        super_agent_id: admin.super_agent_id,
        agent_id: admin.agent_id,
    }
    // update admin
    const updateAdmin = await models.AdminCm.update(data, {
        where: {[Op.and]: [{id: admin_id}, {[Op.not]: {id: currentAdminId}}]},
    })
    if (updateAdmin[0] === 0) throw new ThrowReturn('Admin not found')
    // get admin role
    if (!isEmpty(role_id)) {
        // validate role
        const inputRole = await models.Role.findByPk(role_id[0], {raw: true})
        if (inputRole.level <= currentAdmin.level) throw new ThrowReturn('Invalid admin level')
        const otherAdminRole = await models.AdminCm.findAll({
            where: {id: admin_id},

            include: {model: models.Role, as: 'admin_roles'},
            raw: true,
        })
        // console.log(otherAdminRole)
        const otherAdminRoleId = otherAdminRole.map((c) => c['admin_roles.id'])
        const removeRole = otherAdminRoleId.filter((c) => {
            if (!role_id.includes(c)) return c
        })
        console.log(otherAdminRoleId, removeRole)
        // update role level
        await models.AdminCm.update(
            {level: inputRole.level},
            {where: {[Op.and]: [{id: admin_id}, {[Op.not]: {id: currentAdminId}}]}}
        )
        // add role if not exist
        for (const r of role_id) {
            if (!otherAdminRoleId.includes(r)) {
                await models.AdminHasRole.findOrCreate({
                    where: {role_id: r, admin_id},
                    defaults: {role_id: r, admin_id},
                })
                const initPermission = await models.RoleHasPermission.findAll({where: {role_id: r}, raw: true})
                for (let p of initPermission) {
                    await models.AdminRolePermission.findOrCreate({
                        where: {admin_id, role_id: r, permission_id: p.permission_id},
                        defaults: {admin_id, role_id: r, permission_id: p.permission_id},
                    })
                }
            }
        }
        // remove role if input not exist
        if (!removeRole.includes(undefined) && !isEmpty(removeRole)) {
            await models.AdminHasRole.destroy({where: {admin_id, role_id: {[Op.or]: removeRole}}})
            await models.AdminRolePermission.destroy({where: {admin_id, role_id: {[Op.or]: removeRole}}})
        }
    }

    return res.sendData(null, 'Update admin success!')
}

const changePermission = async (req, res) => {
    const {currentAdminId} = req
    const {admin_id} = req.params
    let {permission_id, role_id} = req.body

    // const currentAdminRoleSQL = `select roles.level, roles.unit_id from admin_cms inner join admin_has_roles on admin_has_roles.admin_id = admin_cms.id inner join roles on admin_has_roles.role_id = roles.id where admin_cms.id = ${currentAdminId}`
    // const currentAdminRole = await db.sequelize.query(currentAdminRoleSQL, {type: db.sequelize.QueryTypes.SELECT})
    const currentAdminRole = await models.AdminCm.findAll({
        where: {id: currentAdminId},
        attributes: ["admin_roles.level"],
        include: {model: models.Role, as: 'admin_roles'},
        raw: true
    })
    if (isEmpty(currentAdminRole[0]?.level)) throw new ThrowReturn("Admin doesn't has any role")
    // modify input data
    if (!role_id) role_id = currentAdminRole[0].role_id
    // check role exist or not
    const adminHasRole = await models.AdminHasRole.findOne({where: {admin_id, role_id}})
    if (isEmpty(adminHasRole)) throw new ThrowReturn("Admin doesn't has this role")
    // remove all permission if exist
    const getCurrentPermissionSQL = await models.AdminRolePermission.findAll({where: {admin_id, role_id}})
    if (!isEmpty(getCurrentPermissionSQL)) await models.AdminRolePermission.destroy({where: {admin_id, role_id}})
    // re-add permission
    for (let p of permission_id) {
        await models.AdminRolePermission.findOrCreate({
            where: {admin_id, permission_id: p, role_id},
            defaults: {admin_id, permission_id: p, role_id},
        })
    }
    return res.sendData(null, 'Change permission success!')
}

const loginPassword = async (req, res) => {
    const {phone, password} = req.body
    const admin = await models.AdminCm.findOne({where: {phone}, raw: true})
    if (isEmpty(admin)) return res.status(404).json({error_code: 1, message: 'Admin not found'})
    await comparePassword(admin.password, password)
    delete admin.password
    const token = await generateToken(admin)
    const refreshToken = await generateRefreshToken(admin.id)
    return res.sendData({token, refreshToken, admin})
}

const sendOTP = async (req, res) => {
    const {phone} = req.body
    const sendMessageAdmin = await models.AdminCm.findOne({where: {phone}})
    if (isEmpty(sendMessageAdmin)) throw new ThrowReturn('Admin not found')
    const response = await fetch(`${OTP_URL}/get_otp_login_cms`, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({phone}),
    })
    const {data, error_code, error_msg} = await response.json()
    if (error_code !== 0) throw new ThrowReturn(error_msg)
    res.sendData(data, 'Send OTP success!')
}

const verifyOTP = async (req, res) => {
    const {phone, code} = req.body
    const verifyAdmin = await models.AdminCm.findOne({where: {phone}, attributes: {exclude: ['password']}, raw: true})
    if (isEmpty(verifyAdmin)) throw new ThrowReturn('Admin not found')
    const response = await fetch(`${OTP_URL}/verify_otp_login_cms`, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({phone, code}),
    })
    const {error_code, error_msg} = await response.json()
    if (error_code !== 0) throw new ThrowReturn(error_msg)
    const token = await generateToken(verifyAdmin)
    const refreshToken = await generateRefreshToken(verifyAdmin.id)

    res.sendData({token, refreshToken, admin: verifyAdmin}, 'verify OTP success!')
}

const all = async (req, res) => {
    const {currentAdminId, currentAdmin} = req
    let {limit, page} = req.query
    if (isEmpty(limit)) limit = 10
    if (isEmpty(page)) page = 1
    let allAdmin = []
    if (currentAdmin.level <= 1) {
        allAdmin = await models.AdminCm.findAll({
            where: {level: {[Op.not]: {level: '1'}}},
            raw: true,
            attributes: adminPropsWillTake
        })
        allAdmin = await getUnitRolePermission(allAdmin)
    } else {
        allAdmin = await getAllChildrenAdmin(currentAdminId, adminPropsWillTake)
    }
    const totalPage = getTotalPage(allAdmin.length, limit)
    const admins = allAdmin.splice(limit * (page - 1), limit * page)
    return res.sendData({data: admins, totalPage})
}

const search = async (req, res) => {
    const {currentAdminId, currentAdmin} = req
    let data = req.query
    if (isEmpty(data.limit)) data.limit = 10
    if (isEmpty(data.page)) data.page = 1

    let allAdmin = []
    if (currentAdmin.level <= 1) {
        allAdmin = await models.AdminCm.findAll({
            where: {level: {[Op.not]: {level: '1'}}},
            raw: true,
            attributes: adminPropsWillTake
        })
        allAdmin = await getUnitRolePermission(allAdmin)
    } else {
        allAdmin = await getAllChildrenAdmin(currentAdminId, adminPropsWillTake)
    }
    allAdmin = filterAdmin(data, allAdmin)
    const totalPage = getTotalPage(allAdmin.length, data.limit)
    const admins = allAdmin.splice(data.limit * (data.page - 1), data.limit * data.page)
    return res.sendData({data: admins, totalPage})
}

const detail = async (req, res) => {
    const {currentAdminId} = req
    let admin = await models.AdminCm.findOne({where: {id: currentAdminId}, attributes: {exclude: ['password']}})
    if (isEmpty(admin)) throw new ThrowReturn('Admin not found')
    admin = await getUnitRolePermission([].concat(admin.dataValues))
    const getMenuForAdminSQL = `select menus.* from admin_cms inner join admin_role_permission on admin_cms.id = admin_role_permission.admin_id inner join permissions on permissions.id = admin_role_permission.permission_id inner join permission_has_menu on permission_has_menu.permission_id = permissions.id inner join menus on permission_has_menu.menu_id = menus.id where admin_cms.id = ${currentAdminId} group by menus.id`
    const menus = await db.sequelize.query(getMenuForAdminSQL, {type: db.sequelize.QueryTypes.SELECT})
    const list = customizeMenu(menus)
    return res.sendData({admin: admin, menu: list})
}

const remove = async (req, res) => {
    const {admin_id} = req.params
    const {currentAdminId, currentAdmin} = req
    // validate input admin
    const removeAdminRole = await models.AdminCm.findByPk(admin_id)
    if (!removeAdminRole || removeAdminRole.level < currentAdmin.level) throw new ThrowReturn('Invalid admin level')
    // remove admin
    const removeAdmin = await models.AdminCm.destroy({
        where: {[Op.and]: [{id: admin_id}, {[Op.not]: {id: currentAdminId}}]},
    })
    if (removeAdmin === 0) throw new ThrowReturn('Admin not found')
    // remove role
    await models.AdminHasRole.destroy({where: {admin_id}})
    // remove permission
    await models.AdminRolePermission.destroy({where: {admin_id}})
    return res.sendData(null, 'Remove success')
}

const token = async (req, res) => {
    const refreshToken = req.body.refresh_token || req.query.refresh_token
    const id = await redispool.getAsync(refreshToken)
    if (isEmpty(id)) throw new ThrowReturn('Refresh token expire!')
    const admin = await models.AdminCm.findOne({where: {id}, attributes: {exclude: ['password']}, raw: true})
    const token = await generateToken(admin)
    res.sendData({token})
}

const createByParent = async (req, res) => {
    const decode = decodeToken(req.headers.authorization)
    const adminCurrentId = decode.id

    var adminByPhone = await models.AdminCm.findOne({where: {phone: req.body.phone}})

    if (adminByPhone != null) throw new ThrowReturn('Phone Admin Exists!')

    var currentAdmin = await models.AdminCm.findOne({where: {id: adminCurrentId}, attributes: {exclude: ['password']}})
    var role = await models.Role.findOne({where: {id: req.body.role_id}})

    if (role.level > 2) {
        var parentAdmin = await models.AdminCm.findOne({where: {id: req.body.parent_id}})
        if (req.body.level <= parentAdmin.level) throw new ThrowReturn('Invalid admin level')
    }

    var data = {
        user_name: req.body.user_name,
        phone: req.body.phone,
        is_active: 'is_active' in req.body ? req.body.is_active : 1,
        parent_id: adminCurrentId,
        level: role.level,
        type_services: role.unit_id,
        super_admin_id: parentAdmin ? parentAdmin.super_admin_id : currentAdmin.super_admin_id,
        admin_id: parentAdmin ? parentAdmin.admin_id : currentAdmin.admin_id,
        super_agent_id: parentAdmin ? parentAdmin.super_agent_id : currentAdmin.super_agent_id,
        agent_id: parentAdmin ? parentAdmin.agent_id : currentAdmin.agent_id,
    }
    parentAdmin
        ? (data[levelAdmin[parentAdmin.level]] = parentAdmin.id)
        : (data[levelAdmin[currentAdmin.level]] = currentAdmin.id)

    var admin = await models.AdminCm.create(data)

    await models.AdminHasRole.create({role_id: role.id, admin_id: admin.id}) // create role
    const initPermission = (await models.RoleHasPermission.findAll({where: {role_id: role.id}})) || [] // create permissions

    for (let p of initPermission) {
        await models.AdminRolePermission.findOrCreate({
            where: {
                admin_id: admin.id,
                role_id: role.id,
                permission_id: p.dataValues.permission_id,
            },
            defaults: {
                admin_id: admin.id,
                role_id: role.id,
                permission_id: p.dataValues.permission_id,
            },
        })
    }

    res.sendData({admin})
}

const getByLevel = async (req, res) => {
    const roleId = req.body.role_id

    let role = await models.Role.findOne({where: {id: roleId}, raw: true})
    let adminHasRoleId = await models.AdminHasRole.findAll({where: { level: (role.level + 1), type_services: role.unit_id }, raw: true})
    const uniqueArr = [... new Set(adminHasRoleId.map(data => data.admin_id))]

    let admins = await models.AdminCm.findAll({where: { id: uniqueArr }})

    res.sendData(admins)
}

const getAll = async (req, res) => {
    var limit = req.body.limit
    var page = req.body.page - 1
    var adminId = req.body.admin_id

    let where = ''
    if (req.body.user_name || (req.body.user_name && req.body.user_name.length)) {
        where = where + ` AND admin_cms.user_name LIKE '%${req.body.user_name}%'`
    }
    if (req.body.level || (req.body.level && req.body.level.length)) {
        where = where + ` AND admin_cms.level = ${req.body.level}`
    }

    var sql = `select * from admin_cms where id = ${adminId}`
    let admin = await db.sequelize.query(sql, {type: db.sequelize.QueryTypes.SELECT})

    if (admin[0].level == 1) {
        var sqlAdmins = `select admin_cms.user_name, admin_cms.id, admin_cms.phone, admin_cms.is_active, roles.id as role_id, roles.name as role_name, units.id as unit_id, units.name as unit_name from admin_cms join admin_has_roles on admin_cms.id = admin_has_roles.admin_id join roles on admin_has_roles.role_id = roles.id join units on roles.unit_id = units.id WHERE NOT admin_cms.level = 1 ${where} limit ${limit} offset ${
            page * limit
        }`
        const admins = await db.sequelize.query(sqlAdmins, {type: db.sequelize.QueryTypes.SELECT})
        res.sendData(admins)
    } else {
        var sqlAdmins = `select admin_cms.user_name, admin_cms.id, admin_cms.phone, admin_cms.is_active, roles.id as role_id, roles.name as role_name, units.id as unit_id, units.name as unit_name from admin_cms join admin_has_roles on admin_cms.id = admin_has_roles.admin_id join roles on admin_has_roles.role_id = roles.id join units on roles.unit_id = units.id  WHERE admin_cms.${
            levelAdmin[admin[0].level]
        } = ${admin[0].id} ${where} limit ${limit} offset ${page * limit}`
        const admins = await db.sequelize.query(sqlAdmins, {type: db.sequelize.QueryTypes.SELECT})
        res.sendData(admins)
    }
}

const updateAdmin = async (req, res) => {
    let adminId = req.body.id
    if (!adminId || (adminId && adminId.length)) throw new ThrowReturn('Admin not found!')
    const decode = decodeToken(req.headers.authorization)
    const adminCurrentId = decode.id

    const phoneExisted = await models.AdminCm.findAll({
        where: {[Op.and]: [{phone: req.body.phone}, {[Op.not]: {id: adminId}}]},
    })
    if (!isEmpty(phoneExisted)) throw new ThrowReturn('Phone existed')

    var currentAdmin = await models.AdminCm.findOne({where: {id: adminCurrentId}, attributes: {exclude: ['password']}})
    var role = await models.Role.findOne({where: {id: req.body.role_id}})

    if (role.level > 2) {
        if (!('parent_id' in req.body)) throw new ThrowReturn('parent_id required!')
        var parentAdmin = await models.AdminCm.findOne({where: {id: req.body.parent_id}})
        console.log('parentAdmin......................', parentAdmin)
        if (role.level <= parentAdmin.level) throw new ThrowReturn('Invalid admin level')
    }

    var data = {
        user_name: req.body.user_name,
        phone: req.body.phone,
        is_active: 'is_active' in req.body ? req.body.is_active : 1,
        parent_id: adminCurrentId,
        level: role.level,
        type_services: role.unit_id,
        super_admin_id: parentAdmin ? parentAdmin.super_admin_id : currentAdmin.super_admin_id,
        admin_id: parentAdmin ? parentAdmin.admin_id : currentAdmin.admin_id,
        super_agent_id: parentAdmin ? parentAdmin.super_agent_id : currentAdmin.super_agent_id,
        agent_id: parentAdmin ? parentAdmin.agent_id : currentAdmin.agent_id,
    }
    parentAdmin
        ? (data[levelAdmin[parentAdmin.level]] = parentAdmin.id)
        : (data[levelAdmin[currentAdmin.level]] = currentAdmin.id)

    const {user_name, phone, is_active, level, type_services, super_admin_id, admin_id, super_agent_id, agent_id} = data

    // update admin
    const updateAdmin = await models.AdminCm.update(
        {
            user_name,
            phone,
            is_active,
            level,
            type_services,
            super_admin_id,
            admin_id,
            super_agent_id,
            agent_id,
        },
        {where: {id: adminId}}
    )
    if (updateAdmin[0] === 0) throw new ThrowReturn('Admin not found')

    res.sendData(updateAdmin)
}

const getParent = async (req, res) => {
    let adminId = req.body.admin_id
    let admin = await models.AdminCm.findOne({where: {id: adminId}}, {type: db.sequelize.QueryTypes.SELECT})
    if (admin.level <= 2) throw new ThrowReturn('No parent Admin!')
    let where = levelAdmin[(admin.level - 1)]
    let parentAdmin = await models.AdminCm.findOne({where: {id: admin[where]}}, {type: db.sequelize.QueryTypes.SELECT})
    res.sendData(parentAdmin)
}

const test = async (req, res) => {
    const allAdmin = await models.AdminCm.findOne({
        where: {id: 1},
        include: {model: models.Role, as: 'admin_roles'},
    })

    res.json(allAdmin)
}

const getAllAdmin = async (req, res) => {
    let allAdmin = await models.AdminCm.findAll()
    allAdmin = allAdmin.reduce((a, c) => {
        return {...a, [c.id]: c.user_name}
    }, {})
    res.sendData(allAdmin)
}

const getAdminChildren = async (req, res) => {
    const currentAdmin = decodeToken(req.headers.authorization)
    let adminHasRole = await models.AdminHasRole.findAll({where: {admin_id: 165}, raw: true})
    res.sendData(adminHasRole)
}

const createFix = async (req, res) => {
    const adminCurrent = decodeToken(req.headers.authorization)
    let role = ''
    let parent = ''
    let dataAdmin = ''
    let dataAdminHasRole = ''
    let unit = ''
    dataAdmin = {
        user_name: req.body.user_name,
        phone: req.body.phone,
        is_active: req.body.is_active,
        password: 'admin',
        parent_id: adminCurrent.id,
        super_admin_id: adminCurrent.super_admin_id,
        admin_id: adminCurrent.admin_id,
        super_agent_id: adminCurrent.super_agent_id,
        agent_id: adminCurrent.agent_id
    }
    let admin = await models.AdminCm.create(dataAdmin)

    for (let roleRequest of req.body.roles) {
        role = await models.Role.findOne({where: {id: roleRequest.role_id}, raw: true})
        unit = await models.Unit.findOne({where: {id: role.unit_id}, raw: true})
        parent = await models.AdminHasRole.findOne({where: {admin_id: roleRequest.parent_id}, raw: true})

        dataAdminHasRole = {
            role_id: role.id,
            admin_id: admin.id,
            admin_type: 'App\Model',
            parent_id: roleRequest.parent_id,
            level_super_admin_id: parent.level_super_admin_id,
            level_admin_id: parent.level_admin_id,
            level_super_agent_id: parent.level_super_agent_id,
            level_agent_id: parent.level_agent_id,
            level: role.level,
            type_services: role.unit_id
        }
        dataAdminHasRole['level_' + levelAdmin[role.level <= 2 ? role.level : role.level - 1]] = roleRequest.parent_id

        await models.AdminHasRole.create(dataAdminHasRole)
    }

    res.sendData('', 'Create Success!')
}

router.getS('/test', test, false)

router.postS('/create', create, true)
router.postS('/login-password', loginPassword, false)
router.postS('/send-otp', sendOTP, false)
router.postS('/verify-otp', verifyOTP, false)
router.postS('/change-permission/:admin_id', changePermission, true)
router.postS('/change-role/:admin_id', changeRole, true)
router.getS('/get-all-admin', getAllAdmin, true)
router.getS('/all', all, true)
router.getS('/search', search, true)
router.getS('/detail', detail, true)
router.getS('/remove/:admin_id', remove, true)
router.postS('/token', token, false)
router.postS('/create-by-parent', createByParent, false)
router.postS('/get-by-level', getByLevel, true)
router.postS('/get-all', getAll, true)
router.postS('/update-admin', updateAdmin, false)
router.postS('/update-admin-role/:admin_id', updateAdminRole, true)
router.postS('/get-parent', getParent, false)
router.postS('/get-children', getAdminChildren, false)
router.postS('/create-fix', createFix, false);

module.exports = router
