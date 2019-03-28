let util = require('util');
let dar = require('digest-auth-request');

let dhCam = {
	urlBase: "http://192.168.1.108/cgi-bin/ptz.cgi"
	,user:"admin"
	,pswd:"tnqCAM2in"
};

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
	exports.getPTZ(camID, function(status){
		cb(status, sts2PtzJson(status));
	});
};

exports.getPTZ = function(camID, cb){
	let url = appendGetParamKeyValue(dhCam.urlBase, "action", "getStatus", true);
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

exports.resetPTZ = function(camID, cb){
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
	  cb(data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  console.log('failed:', errorCode);
	});
};

exports.setPTZ = function(camID, ptzCfg,  cb){
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
	  cb(data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  console.log('failed:', errorCode);
	});
}
exports.gotoRef = function(camID, refID, cb){
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
	  cb(data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  console.log('failed:', errorCode);
	});
};

exports.setRef = function(camID, refID, cb){
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
	  cb(data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  console.log('failed:', errorCode);
	});
};

exports.clrRef = function(camID, refID, cb){
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
	  cb(data);
	},function(errorCode) { 
	  // error callback
	  // tell user request failed
	  console.log('failed:', errorCode);
	});
};