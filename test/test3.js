let ol = require("../lib/objLoc");
let config = require('config')
let dbCfg = config.get('srv.mdb');

process.on('unhandledRejection', (err) => { 
  console.error(err)
  process.exit(1)
});

let cfg = config.get('srv.svcSet.objLoc.setting');
let oee = config.get('srv.svcSet.objLoc.errEnum');

ol.init(cfg, oee);

areaDef = {
    x: 101
    ,y: 101
    ,w: 212
    ,h: 256
}

/*ol.upsertItem('area', 100, areaDef, function(err, resp){
    if (err) {
         console.log("Error:", err);
    }
    else {
         console.log("succ, rst=", resp); 
    }
});*/

ol.listItem('area', {}, function(err, resp){
    if (err) {
         console.log("Error:", err);
    }
    else {
         console.log("succ, rst=", resp); 
    }
});

/*ol.removeItem('area', 101, function(err, resp){
    if (err) {
         console.log("Error:", err);
    }
    else {
         console.log("succ, rst=", resp); 
    }
});*/