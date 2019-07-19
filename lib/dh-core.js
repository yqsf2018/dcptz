let util = require('util');
let dar = require('digest-auth-request');
let db = require('./cam-db');

exports.init = function (dhUrl) {
	// var getRequest = new digestAuthRequest('GET', dhUrl, 'admin', 'tnqCAM2in');
}


let appendGetParamKeyValue = function(url, key, value, fFirst = false) {
	let sep = '&';
	if (true == fFirst) {
		sep = '?';
	}
	return util.format("%s%s%s=%s", url, sep, key, value);
};

let sts2PtzJson = function(stsTxt) {
	let stsLines = stsTxt.split('\n');
	let ptzJson = {};
	stsLines.forEach(function(stsField){
		let field = stsField.split('=');
		if ('status.Postion[0]' == field[0]) {
			ptzJson.pan = Math.round(parseFloat(field[1]));
		}
		else if ('status.Postion[1]' == field[0]) {
			ptzJson.tilt = Math.round(parseFloat(field[1]));
		}
		else if ('status.Postion[2]' == field[0]) {
			ptzJson.zoom = Math.round(parseFloat(field[1]));
		}
		else if ('status.ZoomValue' == field[0]) {
			ptzJson.zoomValue = parseInt(field[1]);
		}
	});
	return ptzJson;
};

exports.getPTZinJson = function(camID, cb){
	exports.getPTZ(camID, function(err, rawStatus){
        if (err) {
            cb(rawStatus);
        }
        else {
            cb(null, sts2PtzJson(rawStatus));    
        }
	});
};

exports.getPTZ = function(camID, cb){
    let dhCam = db.readCam(camID);
	let url = appendGetParamKeyValue(dhCam.urlBase, "action", "getStatus", true);
	let getReq = new dar('GET', url, dhCam.user, dhCam.pswd);
        
	// make the request
	getReq.request(function(data) { 
	  // success callback
	  // do something with the data
	  cb(null, data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  // console.log('failed:', errorCode);
      cb(errorCode);
	});

};

exports.resetPTZ = function(camID, cb){
    let dhCam = db.readCam(camID);
    let url = appendGetParamKeyValue(dhCam.urlBase, "action", "start", true);
    url = appendGetParamKeyValue(url, "channel", "0");
    url = appendGetParamKeyValue(url, "code", "Reset");
    url = appendGetParamKeyValue(url, "arg1", "0");
    url = appendGetParamKeyValue(url, "arg2", "0");
    url = appendGetParamKeyValue(url, "arg3", "0");
    url = appendGetParamKeyValue(url, "arg4", "0");

	let getReq = new dar('GET', url, dhCam.user, dhCam.pswd);
        
	// make the request
	getReq.request(function(data) { 
	  // success callback
	  // do something with the data
	  cb(null,data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  // console.log('failed:', errorCode);
      cb(errorCode);
	});
};

exports.setPTZ = function(camID, ptzCfg,  cb){
    let dhCam = db.readCam(camID);
	let url = appendGetParamKeyValue(dhCam.urlBase, "action", "start", true);
    url = appendGetParamKeyValue(url, "channel", "0");
    url = appendGetParamKeyValue(url, "code", "PositionABS");
    url = appendGetParamKeyValue(url, "arg1", ptzCfg.pan.toString());
    url = appendGetParamKeyValue(url, "arg2", ptzCfg.tilt.toString());
    url = appendGetParamKeyValue(url, "arg3", ptzCfg.zoom.toString());
    url = appendGetParamKeyValue(url, "arg4", "0");

	let getReq = new dar('GET', url, dhCam.user, dhCam.pswd);
        
	// make the request
	getReq.request(function(data) { 
	  // success callback
	  // do something with the data
	  cb(null, data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  console.log('failed:', errorCode);
      cb(errorCode);
	});
}
exports.gotoRef = function(camID, refID, cb){
    let dhCam = db.readCam(camID);
	let url = appendGetParamKeyValue(dhCam.urlBase, "action", "start", true);
    url = appendGetParamKeyValue(url, "channel", "0");
    url = appendGetParamKeyValue(url, "code", "GotoPreset");
    url = appendGetParamKeyValue(url, "arg1", "0");
    url = appendGetParamKeyValue(url, "arg2", refID.toString());
    url = appendGetParamKeyValue(url, "arg3", "0");
    url = appendGetParamKeyValue(url, "arg4", "0");

	let getReq = new dar('GET', url, dhCam.user, dhCam.pswd);
        
	// make the request
	getReq.request(function(data) { 
	  // success callback
	  // do something with the data
	  cb(null, data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  // console.log('failed:', errorCode);
      cb(errorCode);
	});
};

exports.setRef = function(camID, refID, cb){
    let dhCam = db.readCam(camID);
	let url = appendGetParamKeyValue(dhCam.urlBase, "action", "start", true);
    url = appendGetParamKeyValue(url, "channel", "0");
    url = appendGetParamKeyValue(url, "code", "SetPreset");
    url = appendGetParamKeyValue(url, "arg1", "0");
    url = appendGetParamKeyValue(url, "arg2", refID.toString());
    url = appendGetParamKeyValue(url, "arg3", "0");
    url = appendGetParamKeyValue(url, "arg4", "0");

	let getReq = new dar('GET', url, dhCam.user, dhCam.pswd);
        
	// make the request
	getReq.request(function(data) { 
	  // success callback
	  // do something with the data
	  cb(null, data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  //console.log('failed:', errorCode);
      cb(errorCode);
	});
};

exports.clrRef = function(camID, refID, cb){
    let dhCam = db.readCam(camID);
	let url = appendGetParamKeyValue(dhCam.urlBase, "action", "start", true);
    url = appendGetParamKeyValue(url, "channel", "0");
    url = appendGetParamKeyValue(url, "code", "ClearPreset");
    url = appendGetParamKeyValue(url, "arg1", "0");
    url = appendGetParamKeyValue(url, "arg2", refID.toString());
    url = appendGetParamKeyValue(url, "arg3", "0");
    url = appendGetParamKeyValue(url, "arg4", "0");

	let getReq = new dar('GET', url, dhCam.user, dhCam.pswd);
        
	// make the request
	getReq.request(function(data) { 
	  // success callback
	  // do something with the data
	  cb(data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  console.log('failed:', errorCode);
	});
};

exports.gotoPos = function(camID, posCfg, cb){
    let dhCam = db.readCam(camID);
	let url = appendGetParamKeyValue(dhCam.urlBase, "action", "start", true);
    url = appendGetParamKeyValue(url, "channel", "0");
    url = appendGetParamKeyValue(url, "code", "Position");
    url = appendGetParamKeyValue(url, "arg1", posCfg.x.toString());
    url = appendGetParamKeyValue(url, "arg2", posCfg.y.toString());
    url = appendGetParamKeyValue(url, "arg3", posCfg.z.toString());
    url = appendGetParamKeyValue(url, "arg4", "0");

	let getReq = new dar('GET', url, dhCam.user, dhCam.pswd);
        
	// make the request
	getReq.request(function(data) { 
	  // success callback
	  // do something with the data
	  cb(null,data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  // console.log('failed:', errorCode);
      cb(errorCode);
	});
};

exports.zoom = function(camID, zDir, zVal, cb){
    let dhCam = db.readCam(camID);
	let url = appendGetParamKeyValue(dhCam.urlBase, "action", "start", true);
    url = appendGetParamKeyValue(url, "channel", "0");
    let dirStr = "ZoomWide";
    if (zDir>0) {
    	dirStr = "ZoomTele";
    }
    url = appendGetParamKeyValue(url, "code", dirStr);
    url = appendGetParamKeyValue(url, "arg1", "0");
    url = appendGetParamKeyValue(url, "arg2", zVal.toString());
    url = appendGetParamKeyValue(url, "arg3", "0");
    url = appendGetParamKeyValue(url, "arg4", "0");

	let getReq = new dar('GET', url, dhCam.user, dhCam.pswd);
        
	// make the request
	getReq.request(function(data) { 
	  // success callback
	  // do something with the data
	  cb(data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  console.log('failed:', errorCode);
	});
};

exports.approachPos = function(camID, dir, speed, cb){
    let dhCam = db.readCam(camID);
	let url = appendGetParamKeyValue(dhCam.urlBase, "action", "start", true);
    url = appendGetParamKeyValue(url, "channel", "0");
    dirStr = "";
    switch(dir){
    	case 20:
    	    dirStr = "UpTele";
    		break;
    	case 22:
    	    dirStr = "RightUpTele";
    		break;
        case 2:
    	    dirStr = "RightTele";
    		break;
    	case 12:
    	    dirStr = "RightDown";
    		break;
    	case 10:
    	    dirStr = "DownTele";
    		break;
    	case 11:
    	    dirStr = "LeftDownTele";
    		break;
    	case 1:
    	    dirStr = "LeftTele";
    		break;
    	case 21:
    	    dirStr = "LeftUpTele";
    		break;
    }
    if(0==dirStr.length) {
    	console.log("dhCore.approachPos(): unknown direction");
    	return;
    }
    url = appendGetParamKeyValue(url, "code", dirStr);
    url = appendGetParamKeyValue(url, "arg1", speed.toString());
    url = appendGetParamKeyValue(url, "arg2", "1");
    url = appendGetParamKeyValue(url, "arg3", "1");
    url = appendGetParamKeyValue(url, "arg4", "0");

	let getReq = new dar('GET', url, dhCam.user, dhCam.pswd);
        
	// make the request
	getReq.request(function(data) { 
	  // success callback
	  // do something with the data
	  cb(data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  console.log('failed:', errorCode);
	});
};

exports.stopApproach = function(camID, dir, cb){
    let dhCam = db.readCam(camID);
	let url = appendGetParamKeyValue(dhCam.urlBase, "action", "stop", true);
    url = appendGetParamKeyValue(url, "channel", "0");
    dirStr = "";
    switch(dir){
    	case 20:
    	    dirStr = "UpTele";
    		break;
    	case 22:
    	    dirStr = "RightUpTele";
    		break;
        case 2:
    	    dirStr = "RightTele";
    		break;
    	case 12:
    	    dirStr = "RightDown";
    		break;
    	case 10:
    	    dirStr = "DownTele";
    		break;
    	case 11:
    	    dirStr = "LeftDownTele";
    		break;
    	case 1:
    	    dirStr = "LeftTele";
    		break;
    	case 21:
    	    dirStr = "LeftUpTele";
    		break;
    }
    if(0==dirStr.length) {
    	console.log("dhCore.approachPos(): unknown direction");
    	return;
    }
    url = appendGetParamKeyValue(url, "code", dirStr);
    url = appendGetParamKeyValue(url, "arg1", "0");
    url = appendGetParamKeyValue(url, "arg2", "0");
    url = appendGetParamKeyValue(url, "arg3", "0");
    url = appendGetParamKeyValue(url, "arg4", "0");

	let getReq = new dar('GET', url, dhCam.user, dhCam.pswd);
        
	// make the request
	getReq.request(function(data) { 
	  // success callback
	  // do something with the data
	  cb(data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  console.log('failed:', errorCode);
	});
};