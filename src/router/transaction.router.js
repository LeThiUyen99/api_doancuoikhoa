const router = require('./extensions').Router();
let fetch = require('node-fetch');

const {ThrowReturn} = require('./extensions');
const {OTP_URL} = require('../../config/setting');

async function listTransaction(req, res) {
    const query = req.query
    const body = req.body
    let params = ""
    for (const q in query) {
        params+=`${q}=${query[q]}&`
    }
    let url = `${OTP_URL}/get_list_transactions_by_bank?${params}`;
    const response = await fetch(url,{
        method: "POST",
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(body),
    });
    const {data, error_code, error_msg} = await response.json()
    if (error_code !== 0) throw new ThrowReturn(error_msg);
    res.sendData(data);
}

async function infoTotalBank(req, res) {
    const query = req.query
    const body = req.body
    let params = "";
    for (const q in query) {
        params+=`${q}=${query[q]}&`
    }
    let url = `${OTP_URL}/get_info_total_bank?${params}`;
    const response = await fetch(url,{
        method: "POST",
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(body),
    });
    const {data, error_code, error_msg} = await response.json()
    if (error_code !== 0) throw new ThrowReturn(error_msg);
    res.sendData(data);
}

async function exportTransaction(req, res) {
    const query = req.query
    const body = req.body
    let ex = [];
    // let params = "";
    // for (const q in query) {
    //     params+=`${q}=${query[q]}&`
    // }
    // let url = `${OTP_URL}/get_info_total_bank?${params}`;
    // const response = await fetch(url,{
    //     method: "POST",
    //     headers: {'content-type': 'application/json'},
    //     body: JSON.stringify(body),
    // });
    // const {data, error_code, error_msg} = await response.json()
    // if (error_code !== 0) throw new ThrowReturn(error_msg);
    // ex = data;
    setTimeout(()=>{
        res.sendData(ex);
    },5000)
}




router.postS("/list-transaction",listTransaction,true);
router.postS("/get-info-total-bank",infoTotalBank,true);
router.postS("/export-transaction",exportTransaction,true)
module.exports = router;
