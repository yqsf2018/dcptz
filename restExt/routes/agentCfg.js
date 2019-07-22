var express = require('express');
let router = express.Router();
let config = require('config');
let dbg = require('debug')('locRte');
let agnt = require('../../lib/agentCfg');
let errEnum = config.get('srv.svcSet.agntCfg.errEnum');
let stEnum = config.get('srv.svcSet.agntCfg.stEnum');


/* GET home page. */
router.get('/', function(req, res, next) {
  dbg('agnt/');
  res.render('index', { title: 'Express' });
});

router.get('/ver', function(req, res){
    dbg('agnt/ver');
    let verStr = agnt.getVer(req);
    let resp = {
        status:errEnum.ERR_NONE,
        detail:"Unknown"
    };
    if ( ('string' == typeof verStr) && (verStr.length>0) ) {
        resp.detail = verStr;   
    }
    res.status(200).send(resp);
});

let upsertWrapper = function(itemName, reqBody, itemKey, itemDef, res) {
    let funcName = 'upsert-'+itemName;
    dbg("agnt/", funcName, ": reqBody=", reqBody, ", itemKey=", itemKey, ", itemDef=", itemDef);
    if (!(itemDef in reqBody)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(errResp);
        return;
    }
    let key = undefined;
    if(itemKey in reqBody) {
        key = reqBody[itemKey];
    }
    agnt.upsertItem(itemName, key, reqBody[itemDef], function(err, resp){
        dbg("agnt/", funcName, " CB, err=", ", resp=", resp);
        let ret = {
            status:err,
            detail:resp
        };
        let httpStatus = 500;
        if ( errEnum.ERR_NONE == err ) {
            httpStatus = 200;
            ret.status = 'OK';
        }
        else if ( errEnum.ERR_CAM == err ) {
            httpStatus = 400;
        }
        res.status(httpStatus).send(ret);
    });
};

let removeWrapper = function(itemName, reqBody, itemKey, res) {
    let funcName = 'remove-'+itemName;
    dbg("agnt/", funcName, ": reqBody=", reqBody, ", itemKey=", itemKey);
    if (!(itemKey in reqBody)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(errResp);
        return;
    }
    agnt.removeItem(itemName, reqBody[itemKey], function(err, resp){
        dbg("agnt/", funcName, " CB, err=", ", resp=", resp);
        let ret = {
            status:err,
            detail:resp
        };
        let httpStatus = 500;
        if ( errEnum.ERR_NONE == err ) {
            httpStatus = 200;
            ret.status = 'OK';
        }
        else if ( errEnum.ERR_CAM == err ) {
            httpStatus = 400;
        }
        res.status(httpStatus).send(ret);
    });
};

let listWrapper = function(itemName, reqBody, optKey, res) {
    let funcName = 'list-'+itemName;
    dbg("agnt/", funcName, ": reqBody=", reqBody, ": optKey=", optKey);
    if (!(optKey in reqBody)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(errResp);
        return;
    }
    agnt.listItem(itemName, reqBody[optKey], function(err, resp){
        dbg("agnt/", funcName, " CB, err=", ", resp=", resp);
        let ret = {
            status:err,
            detail:resp
        };
        let httpStatus = 500;
        if ( errEnum.ERR_NONE == err ) {
            httpStatus = 200;
            ret.status = 'OK';
        }
        else if ( errEnum.ERR_CAM == err ) {
            httpStatus = 400;
        }
        res.status(httpStatus).send(ret);
    });
};

let statusWrapper = function(reqBody, prockey, res) {
    let funcName = 'status-'+procName;
    dbg("agnt/", funcName, ": reqBody=", reqBody, ": prockey=", prockey);
    if (!(prockey in reqBody)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(errResp);
        return;
    }
    let st = agnt.checkFSM(reqBody[prockey]);
    if (stEnum.UNKNOWN == st) {
        err = "UNKNOW";
    }
    else {
        err = "OK";
    }
    dbg("agnt/status CB, err=", err, ", fsm_st=", st);
    let ret = {
        status:err,
        detail:st
    };
    let httpStatus = 500;
    if ( errEnum.ERR_NONE == err ) {
        httpStatus = 200;
        ret.status = 'OK';
    }
    else if ( errEnum.ERR_CAM == err ) {
        httpStatus = 400;
    }
    res.status(httpStatus).send(ret);
};

router.post('/bd-upsert', function(req, res){
    upsertWrapper("bd", req.body, "bd_id", "bd_def", res);
});

router.post('/bd-del', function(req, res){
    removeWrapper("bd", req.body, "bd_id", res);
});

router.post('/bd-list', function(req, res){
    listWrapper("bd", req.body, "filters", res);
});

router.post('/bd-find', function(req, res){
    listWrapper("bd", req.body, "bd_id", res);
});

router.post('/fd-upsert', function(req, res){
    upsertWrapper("bd", req.body, "bd_id", "bd_def", res);
});

router.post('/fd-del', function(req, res){
    removeWrapper("bd", req.body, "bd_id", res);
});

router.post('/fd-list', function(req, res){
    listWrapper("bd", req.body, "filters", res);
});

router.post('/fd-find', function(req, res){
    listWrapper("fd", req.body, "fd_id", res);
});

module.exports = router;