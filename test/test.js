let util = require('util');
let tobj = require('../lib/dh-core');
let tcalc = require('../lib/ptz-calc');
let msg = '';

testSubj = process.argv[2];
if ('r'==testSubj) {
	tobj.getPTZinJson(0, function(resp, json){
		console.log('resp:', resp);
		console.log('PTZ JSON:', json);
	});
}
else if ('c'==testSubj){
	tobj.resetPTZ(0, function(resp){
		console.log('resp:', resp);
	});
}
else if ('s'==testSubj){
	let ptzCfg = {
		pan: 180
		,tilt:40
		,zoom:100
	};
	if (process.argv.length > 3){
		ptzCfg.pan = parseInt(process.argv[3])
	}
	if (process.argv.length > 4){
		ptzCfg.tilt = parseInt(process.argv[4])
	}
	if (process.argv.length > 5){
		ptzCfg.zoom = parseInt(process.argv[5])
	}
	msg = util.format('Goto PTZ:%d-%d-%d', ptzCfg.pan, ptzCfg.tilt,ptzCfg.zoom);
	console.log(msg);
	tobj.setPTZ(0, ptzCfg, function(resp){
		console.log('resp:', resp);
	});
}
else if ('f'==testSubj){
	let refId = 1;
	let cmd = 'g';
	if (process.argv.length > 3){
		cmd = process.argv[3];
	}
	if (process.argv.length > 4){
		refId = parseInt(process.argv[4])
	}
	msg = 'unknown operation';
	if ('s' == cmd) {
		msg = util.format('set Ref#%d', refId);
		tobj.setRef(0, refId, function(resp){
			console.log('resp:', resp);
		});
	}
	else if ('c' == cmd) {
		msg = util.format('clear Ref#%d', refId);
		tobj.clrRef(0, refId, function(resp){
			console.log('resp:', resp);
		});
	}
	else if ('g' == cmd) {
		msg = util.format('goto Ref#%d', refId);
		tobj.gotoRef(0, refId, function(resp){
			console.log('resp:', resp);
		});
	}
	console.log(msg);
}
else if ('p'==testSubj){
	let posCfg = {
		 x:60
		,y:40
		,z:0
	};
	if (process.argv.length > 3){
		posCfg.x = parseInt(process.argv[3])
	}
	if (process.argv.length > 4){
		posCfg.y = parseInt(process.argv[4])
	}
	if (process.argv.length > 5){
		posCfg.z = parseInt(process.argv[5])
	}
	msg = util.format('Goto POS:%d-%d-%d', posCfg.x, posCfg.y,posCfg.z);
	console.log(msg);
	tobj.gotoPos(0, posCfg, function(resp){
		console.log('resp:', resp);
	});
}
else if ('z'==testSubj){
	let zVal = 20;
	if (process.argv.length > 3){
		zDir = parseInt(process.argv[3])
	}
	if (process.argv.length > 4){
		zVal = parseInt(process.argv[4])
	}
	msg = util.format('Zoom:%d,%d', zDir, zVal);
	console.log(msg);
	tobj.zoom(0, zDir, zVal, function(resp){
		console.log('resp:', resp);
	});
}
else if ('t'==testSubj){
	tcalc.init();
	let target = {
		 x:0
		,y:0
	};
	let zoom = 0;
	if (process.argv.length > 3){
		target.x = parseInt(process.argv[3])
	}
	if (process.argv.length > 4){
		target.y = parseInt(process.argv[4])
	}
	if (process.argv.length > 5){
		zoom = parseInt(process.argv[5])
	}
	let dptz = tcalc.xy2ptz(target);
	msg = util.format('(%d,%d) => (%d,%d)', target.x, target.y, dptz.pan,dptz.tilt);
	console.log(msg);
	console.log('Save Current PTZ as Ref #10');
	tobj.setRef(0, 10, function(resp){
		console.log('setRef resp:', resp);
        if (-1 != resp.indexOf('OK')) {
        	tobj.getPTZinJson(0, function(resp, json){
				console.log('PTZ JSON:', json);
				json.pan += dptz.pan;
				json.tilt += dptz.tilt;
				json.zoom += zoom;
				console.log('Goto PTZ:', json);
				tobj.setPTZ(0, json, function(resp){
					console.log('resp:', resp);
				});
			});
        }
	});
}
else if ('a'==testSubj){
	tcalc.init();
	let target = {
		 x:0
		,y:0
	};
	let zoom = 0;
	if (process.argv.length > 3){
		target.x = parseInt(process.argv[3])
	}
	if (process.argv.length > 4){
		target.y = parseInt(process.argv[4])
	}
	if (process.argv.length > 5){
		speed = parseInt(process.argv[5])
	}
	let dir = tcalc.xy2dir(0, target);
	msg = util.format('(%d,%d) => <%d,%d>', target.x, target.y, dir, speed);
	console.log(msg);
	console.log('Save Current PTZ as Ref #10');
	tobj.setRef(0, 10, function(resp){
		console.log('setRef resp:', resp);
        if (-1 != resp.indexOf('OK')) {
        	tobj.getPTZinJson(0, function(resp, json){
				console.log('PTZ JSON:', json);
				tobj.approachPos(0, dir, speed, function(resp){
					console.log('approachPos resp:', resp);
					setTimeout(tobj.stopApproach, 2000, 0, dir, function(resp){
                        console.log('STOP resp:', resp);
                        	tobj.getPTZinJson(0, function(resp, jsonStop){
                        		console.log('PTZ JSON:', jsonStop);
                        	});
					});
				});
			});
        }
	});
    
}