const {isEmpty} = require('../lib/validate')

const filterAdmin = (filter, allAdmin) => {
    if (!isEmpty(filter.phone)) {
        allAdmin = allAdmin.filter((a) => {
            if (`${a.phone}`.match(`${filter.phone}.*`)) return a
        })
    }
    if (!isEmpty(filter.id)) {
        allAdmin = allAdmin.filter((a) => {
            if (a.id == filter.id) return a
        })
    }
    if (!isEmpty(filter.user_name)) {
        allAdmin = allAdmin.filter((a) => {
            if (`${a.user_name}`.match(`${filter.user_name}.*`)) return a
        })
    }
    if (!isEmpty(filter.is_active)) {
        allAdmin = allAdmin.filter((a) => {
            if (a.is_active == filter.is_active) return a
        })
    }
    if (!isEmpty(filter.parent_id)) {
        allAdmin = allAdmin.filter((a) => {
            if (a.parent_id == filter.parent_id) return a
        })
    }
    if (!isEmpty(filter.level)) {
        allAdmin = allAdmin.filter((a) => {
            if (a.level == filter.level) return a
        })
    }
    if (!isEmpty(filter.super_admin_id)) {
        allAdmin = allAdmin.filter((a) => {
            if (a.super_admin_id == filter.super_admin_id) return a
        })
    }
    if (!isEmpty(filter.admin_id)) {
        allAdmin = allAdmin.filter((a) => {
            if (a.admin_id == filter.admin_id) return a
        })
    }
    if (!isEmpty(filter.super_agent_id)) {
        allAdmin = allAdmin.filter((a) => {
            if (a.super_agent_id == filter.super_agent_id) return a
        })
    }
    if (!isEmpty(filter.agent_id)) {
        allAdmin = allAdmin.filter((a) => {
            if (a.agent_id == filter.agent_id) return a
        })
    }
    if (!isEmpty(filter.role_level)) {
        allAdmin = allAdmin.filter((a) => {
            for (const r of a.roles) {
                if (r.level == filter.role_level) return a
            }
        })
    }
    if (!isEmpty(filter.unit_id)) {
        allAdmin = allAdmin.filter((a) => {
            for (const u of a.units) {
                if (u.id == filter.unit_id) return a
            }
        })
    }
    if (!isEmpty(filter.role_id)) {
        allAdmin = allAdmin.filter((a) => {
            for (const r of a.roles) {
                if (r.id == filter.role_id) return a
            }
        })
    }
    if (!isEmpty(filter.permission_id)) {
        allAdmin = allAdmin.filter((a) => {
            for (const p of a.permissions) {
                if (p.id == filter.permission_id) return a
            }
        })
    }
    return allAdmin;
}


module.exports= {filterAdmin}