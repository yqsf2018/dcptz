let dbg = require('debug')('ptz-calc');

camCfg = {
	focusLen: 27000  // 1/10 um
	,cellSize: 29
	,picWidth: 1920
	,picHeight: 1080
	,hDir:-1
	,vDir:1
};
let K = 1.0;
let scrOrg = {
	x:0
	,y:0
};

let validCfgField = function(cfg, key, typeName) {
	return (typeName == typeof cfg[key]);
};

let validCamCfg = function (cfg) {
	if (!cfg) {
		return false;
	}
	Object.keys(camCfg).forEach(function(key){
		if (false == validCfgField(cfg, key, typeof camCfg[key])){
			return false;
		}
	});
	return true;
};

exports.init = function(cam) {
	K = 180/Math.PI;
	if (validCamCfg(cam)) {
		Object.keys(camCfg).forEach(function(key){
			camCfg[key] = cam[key];
		});
	}
	scrOrg = {
		x:camCfg.picWidth/2
		,y:camCfg.picHeight/2
	}
	dbg('scrOrg=', scrOrg);
};

exports.xy2ptz = function(camID, pos){
	let deltaPTZ = {
		pan:0
		,tilt:0
	};
	deltaPTZ.pan = Math.round(camCfg.hDir*K*Math.atan((pos.x-scrOrg.x)*camCfg.cellSize/camCfg.focusLen));
	deltaPTZ.tilt = Math.round(camCfg.vDir*K*Math.atan((pos.y-scrOrg.y)*camCfg.cellSize/camCfg.focusLen));
    return deltaPTZ;
}