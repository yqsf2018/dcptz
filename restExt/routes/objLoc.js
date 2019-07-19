var express = require('express');
let router = express.Router();
let config = require('config');
let dbg = require('debug')('locRte');
let objloc = require('../../lib/objLoc');
let errEnum = config.get('srv.svcSet.objLoc.errEnum');
let stEnum = config.get('srv.svcSet.objLoc.stEnum');


/* GET home page. */
router.get('/', function(req, res, next) {
  dbg('objloc/');
  res.render('index', { title: 'Express' });
});

router.get('/ver', function(req, res){
    dbg('objloc/ver');
    let verStr = objloc.getVer(req);
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
    dbg("objloc/", funcName, ": reqBody=", reqBody, ", itemKey=", itemKey, ", itemDef=", itemDef);
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
    objloc.upsertItem(itemName, key, reqBody[itemDef], function(err, resp){
        dbg("objloc/", funcName, " CB, err=", ", resp=", resp);
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
    dbg("objloc/", funcName, ": reqBody=", reqBody, ", itemKey=", itemKey);
    if (!(itemKey in reqBody)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(errResp);
        return;
    }
    objloc.removeItem(itemName, reqBody[itemKey], function(err, resp){
        dbg("objloc/", funcName, " CB, err=", ", resp=", resp);
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
    dbg("objloc/", funcName, ": reqBody=", reqBody, ": optKey=", optKey);
    if (!(optKey in reqBody)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(errResp);
        return;
    }
    objloc.listItem(itemName, reqBody[optKey], function(err, resp){
        dbg("objloc/", funcName, " CB, err=", ", resp=", resp);
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
    dbg("objloc/", funcName, ": reqBody=", reqBody, ": prockey=", prockey);
    if (!(prockey in reqBody)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(errResp);
        return;
    }
    let st = objloc.checkFSM(reqBody[prockey]);
    if (stEnum.UNKNOWN == st) {
        err = "UNKNOW";
    }
    else {
        err = "OK";
    }
    dbg("objloc/status CB, err=", err, ", fsm_st=", st);
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

router.post('/area-upsert', function(req, res){
    upsertWrapper("area", req.body, "area_id", "area_def", res);
});

router.post('/area-del', function(req, res){
    removeWrapper("area", req.body, "area_id", res);
});

router.post('/area-list', function(req, res){
    listWrapper("area", req.body, "filters", res);
});

router.post('/cam-upsert', function(req, res){
    upsertWrapper("cam", req.body, "cam_id", "cam_def", res);
});

router.post('/cam-del', function(req, res){
    removeWrapper("cam", req.body, "cam_id", res);
});

router.post('/cam-list', function(req, res){
    listWrapper("cam", req.body, "filters", res);
});

router.post('/vsrc-list', function(req, res){
    listWrapper("vsrc", req.body, "filters", res);
});

router.post('/vsrc-upsert', function(req, res){
    upsertWrapper("vsrc", req.body, "cam_id", "cam_def", res);
});

router.post('/vsrc-del', function(req, res){
    removeWrapper("vsrc", req.body, "cam_id", res);
});

router.post('/region-upsert', function(req, res){
    upsertWrapper("region", req.body, "region_id", "region_def", res);
});

router.post('/region-del', function(req, res){
    removeWrapper("region", req.body, "region_id", res);
});

router.post('/region-list', function(req, res){
    listWrapper("region", req.body, "filters", res);
});

router.post('/obj-upsert', function(req, res){
    upsertWrapper("obj", req.body, "obj_id", "obj_def", res);
});

router.post('/obj-del', function(req, res){
    removeWrapper("obj", req.body, "obj_id", res);
});

router.post('/obj-list', function(req, res){
    listWrapper("obj", req.body, "filters", res);
});

router.post('/face-upsert', function(req, res){
    upsertWrapper("face", req.body, "face_id", "face_def", res);
});

router.post('/face-del', function(req, res){
    removeWrapper("face", req.body, "face_id", res);
});

router.post('/face-list', function(req, res){
    listWrapper("face", req.body, "filters", res);
});

router.post('/fsm-status', function(req, res){
    statusWrapper(req.body, "est", res);
});

module.exports = router;