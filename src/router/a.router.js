let router = require('./extensions').Router();
let models = router.models;
let Op = require('sequelize').Op;
let fetch = require("node-fetch");
let redispool = require("../utils/redispool");
let moment = require('moment');
let db = require('../utils/mysqlpool');

async function test(req,res){
    // let uid = req.query.uid;
    // let data = await models.V11MemberInsurrance.findOne({
    //     where : {id : uid}
    // });
    console.log(typeof redispool.setAsync)
    res.sendData(redispool);
}
async function test_2(req,res){
    let uid = req.query.uid;
    let sql = `SELECT * FROM v11_member_insurrance
    WHERE id = ${uid}`;
    console.log("sql",sql);
    let [info] = await db.query(sql);
    res.sendData(info);
}
router.getS("/test",test,false);
router.getS("/test_2",test_2,false);
module.exports = router;
