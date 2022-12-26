let router = require('./extensions').Router();
let models = router.models;
let Op = require('sequelize').Op;
let fetch = require("node-fetch");
let redispool = require("../utils/redispool");
let moment = require('moment');
let db = require('../utils/mysqlpool');

async function list_user(req,res){
    let { keyword } = Object.assign({}, req.query, req.body)
    let sql = `SELECT u.id, u.fullname, u.nickname FROM users u`;
    if (keyword) {
        sql =  `${sql} WHERE u.fullname like '%${keyword}%' OR u.id like '%${keyword}%'`;
    }
    console.log("sql",sql);
    let [info] = await db.query(sql);
    res.sendData(info);
}

async function upgrade_account(req, res) {
    let { user_id, type } = req.body
    console.log('--------------------------------------------body uodate', JSON.stringify(req.body))
    let sql = `SELECT * FROM v6_upgrade_account_out_system WHERE user_id=${user_id} order by time_upgrade DESC limit 1`;
    let [[upgrade]] = await db.query(sql);
    let type_before = 0;
    if(upgrade) {
        type_before = upgrade.type;
    }
    sql = `INSERT INTO v6_upgrade_account_out_system(user_id,type,type_before,time_upgrade,created_at,updated_at)
                VALUES(${user_id},${type},${type_before},NOW(),NOW(),NOW())
              `;
    console.log('-------------------------------', sql)
    let [data] = await db.query(sql);
    res.sendData(data);
}
router.getS("/list_user",list_user,false);
router.postS("/upgrade_account",upgrade_account,false);
module.exports = router;
