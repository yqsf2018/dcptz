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

let dirThres = {
	x:10
	,y:10
};

let approachLimit = 50;

const fracLimit = 0.5;

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

let validDirCfg = function (dir) {
	if (!dir) {
		return false;
	}
	Object.keys(dir).forEach(function(key){
		if (false == validDirField(cfg, key, typeof dirThres[key])){
			return false;
		}
	});
	return true;
};


let convDirThr = function (i, l) {
	if(i>1){
		return Math.round(l/i);	
	}
	else if (i>fracLimit) {
		return approachLimit;
	}
	else if (i>0) {
		return Math.round(i*l);
	}
	else {
		return approachLimit;
	}
}

exports.init = function(cam, dirThr) {
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
	if (validDirCfg(dirThr)) {
        dirThres.x = convDirThr(dirThr.x, camCfg.picWidth);
	    dirThres.y =  convDirThr(dirThr.y, camCfg.picHeight);
	}
	else {
		dirThres.x = approachLimit;
        dirThres.y = approachLimit;
	}
	dbg('dirThres=', dirThres);
};

exports.xy2ptz = function(pos){
	let deltaPTZ = {
		pan:0
		,tilt:0
	};
	deltaPTZ.pan = Math.round(camCfg.hDir*K*Math.atan((pos.x-scrOrg.x)*camCfg.cellSize/camCfg.focusLen));
	deltaPTZ.tilt = Math.round(camCfg.vDir*K*Math.atan((pos.y-scrOrg.y)*camCfg.cellSize/camCfg.focusLen));
    return deltaPTZ;
}

exports.xy2dir = function(camID, pos){
	let dx = pos.x-scrOrg.x;
	let dy = pos.y-scrOrg.y;
	let dir = 0;

	if(dx < -dirThres.x) {
		dir += 1
	}
	else if (dx > dirThres.x){
		dir += 2;
	}
	if(dy > dirThres.y) {
		dir += 10
	}
	else if (dy < -dirThres.y){
		dir += 20;
	}
    return dir;
}