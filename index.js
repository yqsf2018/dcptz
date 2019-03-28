let dhCore = require('./lib/dh-core');
let ptzConv = require('./lib/ptz-conv');
let camdb = require('./lib/camdb');

exports.init = function(camCfg, cb){

exports.init = function(camCfgFile) {
	return (
		new Promise(camCfgFile, function(resolve, reject)){
			cfgStat = fs.stat(camCfgFile, function(err, cfgStat){
				if(err.ENOENT || cfgStat.isFile()) {
					return camdb.newDB(camCfgFile)
				} 
			});
			if (cfgStat.isFile()) {
				resolve()
			}
			else {

			}
	return 
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

	camdb.load(camCfgFile, cb);
};

exports.save = function(camID, camCfgFile, cb){

};

exports.getCamCfg = function(camID, cb){

};

exports.getPTZ = function(camID, cb){

};

exports.resetPTZ = function(camID, cb){

};

exports.setPTZ = function(camID, ptzCfg,  cb){

};

exports.gotoRef = function(camID, refID, cb){

};

exports.setRef = function(camID, refID, cb){

};

exports.gotoXY = function(camID, x, y, cb){

};


