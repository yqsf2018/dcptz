let dhCore = require('./dh-core');
let ptzCalc = require('./ptz-calc');
let camdb = require('./cam-db');
let config = require('config');
let util = require('util');
let dbg = require('debug')('dcLib');
let camCfg = config.get("srv.svcSet.dc.setting");
let errEnum = config.get("srv.svcSet.dc.errEnum");

let fInCalib;
let calibConfCnt;
let calibFailCnt;

let calibTaskCfg = {
	camID:0
	,cb:null
	,opResp:{}
	,target:{
		pan:-99
		,tilt:-99
		,zoom:-99
	}
	,calibErr:{
		pan:2
		,tilt:2
		,zoom:5
	}
	,fSelfCalib:false
	,calibConfCnt:0
    ,calibFailCnt:0
};

let validCfgField = function(cfg, key, typeName) {
	return (typeName == typeof cfg[key]);
};

let validPtzCfg = function (cfg) {
	if (!cfg) {
		return false;
	}
	Object.keys(camCfg.dfltPtzCfg).forEach(function(key){
		if (false == validCfgField(cfg, key, typeof camCfg.dfltPtzCfg[key])){
			return false;
		}
	});
	return true;
};

let calibSetTarget = function(taskCfg, ptzCfg){
	 taskCfg.fSelfCalib = !validPtzCfg(ptzCfg);
	 if (false == taskCfg.fSelfCalib){
	 	taskCfg.target.pan = ptzCfg.pan;
		taskCfg.target.tilt = ptzCfg.tilt;
		taskCfg.target.zoom = ptzCfg.zoom;
	 }
	 else {
	 	taskCfg.target.pan = camCfg.dfltPtzCfg.pan;
		taskCfg.target.tilt = camCfg.dfltPtzCfg.tilt;
		taskCfg.target.zoom = camCfg.dfltPtzCfg.zoom;
	 }
};

let calibSetDfltSelfErr = function(taskCfg){
	taskCfg.calibErr.pan = camCfg.dfltPtzErr.pan;
	taskCfg.calibErr.tilt = camCfg.dfltPtzErr.tilt;
	taskCfg.calibErr.zoom = camCfg.dfltPtzErr.zoom;
};

let isSameLoc = function(dest, cur, errD) {
	return ( 
		(Math.abs(dest.pan - cur.pan) <= errD.pan)
		&& (Math.abs(dest.tilt - cur.tilt) <= errD.tilt)
		&& (Math.abs(dest.zoom - cur.zoom) <= errD.zoom) 
	);
};

let zval2zoom = function (zval){
	dbg('zval=',zval);
	if (zval>camCfg.zoomValBase) {
		return Math.round((zval - 90.44)/1.52);	
	}
	return 0;
	
};

let calibTask = function(taskCfg) {
	dbg('calibTask: taskCfg=', taskCfg);
	dhCore.getPTZinJson(taskCfg.camID, function(err, jsonPTZ){
		if (err) {
			taskCfg.calibFailCnt++;
			if (taskCfg.calibFailCnt >= camCfg.calibFailMax) {
				/* reach failure limit, no more timer task */
				let calibResp = {
					opResp:taskCfg.opResp
					,calibErr:err
				}
				fInCalib = false;
				taskCfg.cb(errEnum.ERR_CALIB, calibResp);
			}
			else { /* post another calib task */
				setTimeout(calibTask, camCfg.calibInterval, taskCfg);
			}
		}
		else {
			taskCfg.calibFailCnt = 0;
			jsonPTZ.zoom = zval2zoom(jsonPTZ.zoomValue);
			if (true == isSameLoc(taskCfg.target, jsonPTZ, taskCfg.calibErr)){
				taskCfg.calibConfCnt++;
				if (taskCfg.calibConfCnt >= camCfg.calibConfThrs) {
					dbg("calibration is done");
					/* calibration is done */
					fInCalib = false;
					taskCfg.cb(errEnum.ERR_NONE, taskCfg.opResp);
					/* no more timer task */
					return;
				}
			}
			else {
				taskCfg.calibConfCnt = 0;
				if (taskCfg.fSelfCalib = true){ /* no preset target, set the first */
					taskCfg.target.pan = jsonPTZ.pan;
					taskCfg.target.tilt = jsonPTZ.tilt;
					taskCfg.target.zoom = jsonPTZ.zoom;
				}
			}
			setTimeout(calibTask, camCfg.calibInterval, taskCfg);
		}
	});
};

let doCalib = function (camID, cb, resp, ptzCfg=null) {
	calibTaskCfg.calibFailCnt = 0;
	calibTaskCfg.calibConfCnt = 0;
	calibTaskCfg.camID = camID;
	calibTaskCfg.cb = cb;
	if ( ('object' == typeof resp) 
		|| ('array' == typeof resp) 
	){
		calibTaskCfg.opResp = object.assign({}, resp);
	}
	else {
		calibTaskCfg.opResp = resp;	
	}
	calibSetTarget(calibTaskCfg, ptzCfg);
	calibSetDfltSelfErr(calibTaskCfg);
	fInCalib = true;
	calibTask(calibTaskCfg);
};

exports.init = function(camCfgFile, camErrEnum, stEnum, cb) {
	/*return (
		new Promise(camCfgFile, function(resolve, reject)){
			cfgStat = fs.stat(camCfgFile, function(err, cfgStat){
				if(err.ENOENT || cfgStat.isFile()) {
					return camdb.loadDB(camCfgFile)
				} 
			});
			if (cfgStat.isFile()) {
				resolve()
			}
			else {

			}
	return */
	ptzCalc.init();
	fInCalib = false;
	cb(null);
};

exports.getVer = function (req) {
    dbg('lib/dc.gerVer:',camCfg.version);
    return camCfg.version;
};

exports.addCam = function(camCfg, cb){
	if (validCamCfg(camCfg)) {
		let i = '';
		if ('camID' in camCfg) {
			i = camCfg.camID;
		}
		else {
			i = getCamID(camCfg);
		}
		cams[i] = {};
		cams[i].hostip = camCfg.ip;
		cams[i].make = camCfg.make;
		cams[i].model = camCfg.model;
		cams[i].fwVer = camCfg.fwVer;
		cams[i].user = camCfg.user;
		cams[i].pswd = camCfg.pswd;
		camdb.save(i, cam)
	}
	else{
		return '';
	}
	camdb.init(camCfg, cb);
};

exports.load = function(camCfgFile, cb){

	// camdb.loadCamDb(camCfgFile, cb);
	cb(errEnum.ERR_NONE,null);
};

exports.save = function(camID, camCfgFile, cb){
	cb(errEnum.ERR_NONE,null);
};

exports.getCamCfg = function(camID, cb){
	cb(errEnum.ERR_NONE,null);
};

exports.getPTZ = function(camID, cb){
	dhCore.getPTZinJson(camID, function(err, jsonPTZ){
		if (err) {
			cb(errEnum.ERR_CAM, err);
		}
		else {
			cb(errEnum.ERR_NONE,jsonPTZ);
		}
	});
};

exports.resetPTZ = function(camID, cb){
	dhCore.resetPTZ(camID, function(err, resp){
		if (err) {
			cb(errEnum.ERR_CAM, resp);
		}
		else {
			cb(errEnum.ERR_NONE,resp);
		}
	});
};

exports.setPTZ = function(camID, ptzCfg, fCal, cb){
	dhCore.setPTZ(camID, ptzCfg, function(err, resp){
		if (err) {
			cb(errEnum.ERR_CAM, resp);
		}
		else {
			if (true == fCal) {
				doCalib(camID, cb, resp, ptzCfg);
			}
			else {
				cb(errEnum.ERR_NONE,resp);
			}
		}
	});
};

exports.gotoRef = function(camID, refID, fCal, cb){
	dhCore.gotoRef(camID, refID, function(err, resp){
		if (err) {
			cb(errEnum.ERR_CAM, resp);
		}
		else {
			if (true == fCal) {
				doCalib(camID, cb, resp);
			}
			else {
				cb(errEnum.ERR_NONE,resp);
			}
		}
	});
};

exports.setRef = function(camID, refID, cb){
	dhCore.setRef(camID, refID, function(err, resp){
		if (err) {
			cb(errEnum.ERR_CAM, resp);
		}
		else {
			cb(errEnum.ERR_NONE,resp);
		}
	});
};

exports.gotoXY = function(camID, dx, dy, dzoom, fCal, cb){
	let target ={
		x:dx
		,y:dy
	}
	let dptz = ptzCalc.xy2ptz(target);
	dhCore.getPTZinJson(camID, function(err, jsonPTZ){
		if (err) {
			cb(errEnum.ERR_CAM, err);
			return;
		}
		// console.log('PTZ JSON:', json);
		jsonPTZ.pan += dptz.pan;
		jsonPTZ.tilt += dptz.tilt;
		jsonPTZ.zoom += dzoom;
		msg = util.format('(%d,%d) => (%d,%d)', target.x, target.y, dptz.pan,dptz.tilt);
	    console.log(msg);
		// console.log('Goto PTZ:', json);
		dhCore.setPTZ(camID, jsonPTZ, function(err, resp){
			if (err) {
				cb(errEnum.ERR_CAM, resp);
			}
			else {
				if (true == fCal) {
					doCalib(camID, cb, resp, jsonPTZ);
				}
				else {
					cb(errEnum.ERR_NONE,resp);
				}
			}
		});
	});
};
