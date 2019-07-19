var express = require('express');
var router = express.Router();
let config = require('config');
let dbg = require('debug')('dcRte');
let dcam = require('../../lib/dc');
let errEnum = config.get('srv.svcSet.dc.errEnum');

/* GET home page. */
router.get('/', function(req, res, next) {
  dbg('dc/');
  res.render('index', { title: 'Express' });
});

router.get('/ver', function(req, res){
    dbg('dc/ver');
    let verStr = dcam.getVer(req);
    let resp = {
        status:errEnum.ERR_NONE,
        detail:"Unknown"
    };
    if ( ('string' == typeof verStr) && (verStr.length>0) ) {
        resp.detail = verStr;   
    }
    res.status(200).send(resp);
});

router.post('/ptz-get', function(req, res){
    dbg('dc/ptz-get, req.body=', req.body);
    if (!("cam_id" in req.body)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(resp);
        return;
    }
    dcam.getPTZ(req.body.cam_id, function(err, cam_resp){
        dbg('dc/ptz-get CB, err=', ',cam_resp=', cam_resp);
        let resp = {
            status:err,
            detail:cam_resp
        };
        let httpStatus = 500;
        if ( errEnum.ERR_NONE == err ) {
            httpStatus = 200;
        }
        else if ( errEnum.ERR_CAM == err ) {
            httpStatus = 400;
        }
        res.status(httpStatus).send(resp);
    });
});

router.post('/ptz-reset', function(req, res){
    dbg('dc/reset-ptz, req.body=', req.body);
    if (!("cam_id" in req.body)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(resp);
        return;
    }
    dcam.resetPTZ(req.body.cam_id, function(err, cam_resp){
        dbg('dc/reset-ptz CB, err=', ',cam_resp=', cam_resp);
        let resp = {
            status:err,
            detail:cam_resp
        };
        let httpStatus = 500;
        if ( errEnum.ERR_NONE == err ) {
            httpStatus = 200;
        }
        else if ( errEnum.ERR_CAM == err ) {
            httpStatus = 400;
        }
        res.status(httpStatus).send(resp);
    });
});

let validptzSetReq = function (req) {
    return ( ("cam_id" in req)
        && ("pan" in req) && ('number' == typeof req.pan)
        && ("tilt" in req) && ('number' == typeof req.tilt)
        && ("zoom" in req) && ('number' == typeof req.zoom)
        );
};

router.post('/ptz-set', function(req, res){
    dbg('dc/ptz-set, req.body=', req.body);
    if (!validptzSetReq(req.body)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(resp);
        return;
    }
    let ptzCfg = {
        pan:req.body.pan
        ,tilt:req.body.tilt
        ,zoom:req.body.zoom
    };
    let fCalib = true;
    if ('calib' in req.body) {
        fCalib = req.body.calib;
    }
    dcam.setPTZ(req.body.cam_id, ptzCfg, fCalib, function(err, cam_resp){
        dbg('dc/ptz-set CB, err=',err, ',cam_resp=', cam_resp);
        let resp = {
            status:err,
            detail:cam_resp
        };
        let httpStatus = 500;
        if ( errEnum.ERR_NONE == err ) {
            httpStatus = 200;
        }
        else if ( errEnum.ERR_CAM == err ) {
            httpStatus = 400;
        }
        res.status(httpStatus).send(resp);
    });
});

let validPosGoReq = function (req) {
    return ( ("cam_id" in req)
        && ("pos_x" in req) && ('number' == typeof req.pos_x)
        && ("pos_y" in req) && ('number' == typeof req.pos_y)
        && ("zoom_in" in req) && ('number' == typeof req.zoom_in)
        );
};

router.post('/pos-go', function(req, res){
    dbg('dc/pos-go, req.body=', req.body);
    if (!validPosGoReq(req.body)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(resp);
        return;
    }
    let fCalib = true;
    if ('calib' in req.body) {
        fCalib = req.body.calib;
    }
    dcam.gotoXY(req.body.cam_id, req.body.pos_x, req.body.pos_y, req.body.zoom_in, fCalib, function(err, cam_resp){
        dbg('dc/pos-go CB, err=', ',cam_resp=', cam_resp);
        let resp = {
            status:err,
            detail:cam_resp
        };
        let httpStatus = 500;
        if ( errEnum.ERR_NONE == err ) {
            httpStatus = 200;
        }
        else if ( errEnum.ERR_CAM == err ) {
            httpStatus = 400;
        }
        res.status(httpStatus).send(resp);
    });
});

let validPresetGoReq = function (req) {
    return ( ("cam_id" in req)
        && ("ref_id" in req) && ('number' == typeof req.ref_id)
        );
};

router.post('/preset-go', function(req, res){
    dbg('dc/preset-go, req.body=', req.body);
    if (!validPresetGoReq(req.body)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(resp);
        return;
    }
    let fCalib = true;
    if ('calib' in req.body) {
        fCalib = req.body.calib;
    }
    dcam.gotoRef(req.body.cam_id, req.body.ref_id, fCalib, function(err, cam_resp){
        dbg('dc/preset-go CB, err=', ',cam_resp=', cam_resp);
        let resp = {
            status:err,
            detail:cam_resp
        };
        let httpStatus = 500;
        if ( errEnum.ERR_NONE == err ) {
            httpStatus = 200;
        }
        else if ( errEnum.ERR_CAM == err ) {
            httpStatus = 400;
        }
        res.status(httpStatus).send(resp);
    });
});

let validPresetSaveReq = function (req) {
    return ( ("cam_id" in req)
        && ("ref_id" in req) && ('number' == typeof req.ref_id)
        );
};

router.post('/preset-save', function(req, res){
    dbg('dc/preset-save, req.body=', req.body);
    if (!validPresetSaveReq(req.body)) {
        let errResp = {
          message: "Invalid Request",
          error: errEnum.ERR_INV_REQ
        }
        res.status(400).send(resp);
        return;
    }
    dcam.setRef(req.body.cam_id, req.body.ref_id, function(err, cam_resp){
        dbg('dc/preset-save CB, err=', ',cam_resp=', cam_resp);
        let resp = {
            status:err,
            detail:cam_resp
        };
        let httpStatus = 500;
        if ( errEnum.ERR_NONE == err ) {
            httpStatus = 200;
        }
        else if ( errEnum.ERR_CAM == err ) {
            httpStatus = 400;
        }
        res.status(httpStatus).send(resp);
    });
});

module.exports = router;
