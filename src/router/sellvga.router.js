let router = require('./extensions').Router();
let models = router.models;
let Op = require('sequelize').Op;
let fetch = require("node-fetch");
let redispool = require("../utils/redispool");
let moment = require('moment');
// let axios = require('axios')
let db = require('../utils/mysqlpool');
const { log } = require('../utils/logger');
const {OTP_URL} = require("../../config/setting");
const {ThrowReturn} = require("./extensions");
const { isEmpty } = require('../lib/validate');
const { getTotalPage } = require('../lib/formatData');

async function search_vga(req, res) {
    // const current_id = req.currentAdminId;
    // const parent_id = req.parent_id;
    // log.error('---------------------------------agent',parent_id)
    let body = req.query;

    console.log("......................",body)
    const params = Object.keys(body).map(key => {
        return `${key}=${body[key]}`;
    }).join('&');
    let url = `${OTP_URL}/search_vga_change?${params}`;
    // const data = await axios.get(url)
    const response = await fetch(url)
    const {data} = await response.json()
    log.error(data)
    console.log(req.query);
    // console.log('---------------------------------req', req.query)
    // console.log('data axios',data.data.data)
    res.sendData(data)
}
async function list_buyer(req, res) {
    // const {number,q,page} = req.query
    const {currentAdminId} = req
    const body = req.query;
    let admin = await models.AdminCm.findOne({ where: { id: currentAdminId }, attributes: { exclude: ['password'] } });
    const parent_id = admin.parent_id
    console.log("----------------------gggg----", parent_id)

    const params = Object.keys(body).map(key => {
        return `${key}=${body[key]}`;
    }).join('&');
    // console.log('------------------------------', params)
    let url = `${OTP_URL}/search_vga?${params}`;
    // console.log('..................url lay user : ', url)
    const response = await fetch(url,{
        method: "POST"
    });

    const {data} = await response.json()
    res.sendData({data,currentAdminId, parent_id});
}
async function change_vga(req, res) {
    const {vga_owner,vga_change,description_request,total_pay_request,agent_id,cms_id, super_admin_id,super_agent_id, admin_id, cms_out_id} = req.body
    let body = req.query;
    const params = Object.keys(body).map(key => {
        return  `${key}=${body[key]}`;
    }).join('&')
    const  url = `${OTP_URL}/change_vga?${params}`;

    const requestBody = {vga_owner, vga_change, description_request,total_pay_request,agent_id,cms_id, super_admin_id,super_agent_id, admin_id, cms_out_id}
    const response = await fetch(url, {
        method: "post",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestBody)
    })
    const data = await response.json()
    if(data.error_code===1) throw new ThrowReturn(data.error_msg)
    res.sendData(data.data);
}

async function history_vga(req, res) {
    const {agent_id,cms_id, time_step_1, time_step_2, super_admin_id, super_agent_id, admin_id, level} = req.body
    let body = req.query;
    const params = Object.keys(body).map(key => {
        return `${key}=${body[key]}`;
    }).join('&');
    log.error('-----------------------params', params)
    let url = `${OTP_URL}/history_change_vga?${params}`;
    const requestBody = {agent_id,cms_id, time_step_1, time_step_2, super_admin_id, super_agent_id, admin_id, level}
    log.error('------------------------------reques', requestBody)
    const response = await fetch(url, {
        method: "post",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestBody)
    })
    const data = await response.json()
    res.sendData(data.data);
}

async function total_vga(req, res) {
    const {cms_id, super_admin_id, super_agent_id, admin_id, agent_id, number_discount} = req.body
    const params = req.query
    let url = `${OTP_URL}/get_info_total_change_vga?${params}`;
    const requestBody = {cms_id, super_admin_id, super_agent_id, admin_id, agent_id, number_discount};
    console.log('---------------------------body', requestBody)
    const response = await fetch(url, {
        method: "post",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestBody)
    })
    const data = await response.json()
    log.error('--------------------------------------senda', data)
    res.sendData(data.data)
}

const createConfirmSell = async (req, res) => {
    const {currentAdminId} = req
    const data = req.body
    const confirmSellVga = {
        user_id: data.user_id,
        order_id: data.order_id,
        vga_change: data.vga_change,
        vga_owner: data.vga_owner,
        type: data.type,
        uid_cms_change: data.uid_cms_change,
        agent_out_id: data.agent_out_id,
        cms_out_id: data.cms_out_id,
        super_admin_out_id: data.super_admin_out_id,
        super_agent_out_id: data.super_agent_out_id,
        admin_out_id: data.admin_out_id,
        amount: data.amount,
        status: data.status,
        source: data.source,
        is_refund: data.is_refund,
        description_request: data.description_request,
        sell_by_admin: data.sell_by_admin || currentAdminId,
    }
    await models.HistoryUserOrderVga.create(confirmSellVga)
    return res.sendData(null, 'Create success!')
}

const listConfirmSell = async (req, res) => {
    const {} = req.query
    let {limit, page, vga_change, vga_owner, amount, cms_out_id, from, to} = req.query
    if(isEmpty(limit)) limit = 10
    if(isEmpty(page)) page = 1
    const all = await models.HistoryUserOrderVga.findAll({
        where: {
            [Op.and]: [
                {status: 0},
                vga_change ? {vga_change} : {},
                vga_owner ? {vga_owner} : {},
                amount ? {amount: {[Op.startsWith]: amount}} : {},
                cms_out_id ? {cms_out_id} : {},
                from && to ? {created_at: {[Op.gte]: moment(parseInt(from*1000)).format('YYYY-MM-DD'), [Op.lte]:  moment(parseInt(to*1000)).format('YYYY-MM-DD')}} : {},
            ],
        },
        attributes: ['id'],
    })
    const list = await models.HistoryUserOrderVga.findAll({
        where: {
            [Op.and]: [
                {status: 0},
                vga_change ? {vga_change} : {},
                vga_owner ? {vga_owner} : {},
                amount ? {amount: {[Op.startsWith]: amount}} : {},
                cms_out_id ? {cms_out_id} : {},
                from && to ? {created_at: {[Op.gte]: moment(parseInt(from*1000)).format('YYYY-MM-DD'), [Op.lte]:  moment(parseInt(to*1000)).format('YYYY-MM-DD')}} : {},
            ],
        },
        offset: parseInt(page - 1),
        limit: parseInt(limit),
    })
    const totalPage = getTotalPage(all.length, limit)
    return res.sendData({data: list, totalPage})
}

const updateConfirmSell = async (req, res) => {
    const {sell_id} = req.params
    const {currentAdminId} = req
    const data = req.body
    const confirmSellVga = {
        status: data.status,
        sell_by_admin: currentAdminId,
    }
    await models.HistoryUserOrderVga.update(confirmSellVga, {where: {id: sell_id}})
    return res.sendData(null, 'Update success!')
}

async function removeConfirmSell(req, res) {
    const {sell_id} = req.params
    await models.HistoryUserOrderVga.destroy({where: {id: sell_id}})
    return res.sendData(null, 'Remove success!')
}


router.getS("/search_vga",search_vga,true);
router.postS("/list_buyer",list_buyer,true);
router.postS("/change_vga",change_vga,true);
router.postS("/history_vga",history_vga,true);
router.postS("/total_vga",total_vga,true);
router.postS('/create-confirm-sell', createConfirmSell, true)
router.getS('/remove-confirm-sell/:sell_id', removeConfirmSell, true)
router.postS('/update-confirm-sell/:sell_id', updateConfirmSell, true)
router.getS('/list-confirm-sell', listConfirmSell, true)


module.exports = router;
