let config = require('config');
let util = require('util');
let async = require('async');
let dbg = require('debug')('objlocLib');
let db = require("../lib/dbAccess");

let objLocCfg; // = config.get("srv.svcSet.objLoc.setting");
let errEnum;  // = config.get("srv.svcSet.objLoc.errEnum");
let stEnum;

process.on('unhandledRejection', (err) => { 
  console.error(err)
  process.exit(1)
});

let listCache = {};

let fsm = {
};

let preload = function() {
    async.forEachOfSeries(objLocCfg.preloadList, function (expTime, key, cb) {
        if (0==expTime) {
            dbg("skip preloading ", key);
            listCache[key] = [];
            return cb(null);
        }
        // dbg("preload(): key=", key, "fPreload=", fPreload);
        let listOpt = {
            cond:{}
            ,lmtOpt:0
            ,skpOpt:0
        };
        if (expTime > 0) {
            let deadline = new Date();
            deadline.setTime(deadline.getTime() - expTime*1000);
            listOpt.cond.createTime = {"$gte":deadline};
            dbg("preload ", key, " no earlier than ", deadline.toISOString());
        }
        else {
            dbg("preload ", key, " without restriction");   
        }
        exports.listItem(key, listOpt, function(err, resp){
            // dbg("preload(): resp=", resp);
            if ( errEnum.ERR_NONE == err ) {
                listCache[key] = resp.list;
                cb(null);
            }
            else {
                dbg(util.format("error in retrieve the list %s:%s", key, err));
                cb(err);
            }
        });
    }, function (err) {
        if (err) {
            /* quit if failed to fetch cache */
            process.exit(-3);
        } 
        console.log("Fetch lists of", objLocCfg.preloadList);
        console.log("listCache=", listCache);
    });
}

exports.init = function(CfgFile, objLocErrEnum, stEnum) {
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
    objLocCfg = Object.assign({}, CfgFile);
    // console.log("objLocCfg=",objLocCfg);
    errEnum = Object.assign({}, objLocErrEnum);
    stEnum = Object.assign({}, stEnum);
    fsm = {
        "BD": {
            st:stEnum.IDLE
        }
        ,"FD": {
            st:stEnum.IDLE
        }
        ,"PE": {
            st:stEnum.IDLE
        }
    };
    let dbCfg = config.get('srv.mdb');
    db.init(dbCfg);
    preload();
};

exports.getVer = function (req) {
    dbg('lib/objloc.gerVer:',objLocCfg.version);
    return objLocCfg.version;
};

let upsertLoc = function(loc_id, loc_def, cb) {
    let cond = {locId:loc_id};
    let newDoc = loc_def;
    let rst;
    let loc_resp = {
        nAdded:0
        ,nModified:0
    };
    let err = errEnum.ERR_NONE;
    
    db.upsertRecords(objLocCfg.rgnColl, cond, newDoc)
    .then((rst)=>{
        dbg("upsertLoc():rst=", rst);
        if (1==rst.result.ok){
            loc_resp.nAdded = rst.upsertedCount;
            loc_resp.nModified = rst.modifiedCount;  
        }
        else {
            err = errEnum.ERR_DB;
        }
        cb(err, loc_resp);
    })
    .catch((err)=>{
        dbg("upsertLoc():err=", err);
        err = errEnum.ERR_EXCEPT;
        loc_resp.errMsg = rst.errMsg;
        cb(err, loc_resp);
    });
};

let getCollName = function(itemName){
    let item = itemName.toLowerCase();
    if (item in objLocCfg.preloadList){
        return item+"s";
    }
    return undefined;
};

let getCollKey = function(itemName){
    let item = itemName.toLowerCase();
    if (item in objLocCfg.preloadList){
        return item+"_id";
    }
    return undefined;
};

let getParentContainer = function(childItem) {
    if ('obj' == childItem) {
        return "region";
    }
    else if ('face' == childItem) {
        return "obj";
    }
    return undefined;
};

let isBetween = function(x0, lowerB, upperB) {
    return ( ((x0-lowerB)*(upperB-x0))>0 );
};

let rectMatch = function(rect, containers, keyID) {
    for(let i =0;i<containers.length;i++){
        let box = containers[i];
        if( (true==isBetween(rect.left + rect.width/2, box.rect.left, box.rect.left+box.rect.width-1))
            && (true==isBetween(rect.top + rect.height/2, box.rect.top, box.rect.top+box.rect.height-1))
        ){
            return box[keyID];
        }
    }
    return 0;
};

let save2Cache = function (itemName, collKey, itemId, newDoc) {
    if (itemName in listCache) {
        let newCacheDoc = Object.assign({}, newDoc);
        newCacheDoc[collKey] = itemId;
        listCache[itemName].push(newCacheDoc);
        dbg("add ", itemName, " item:", newCacheDoc);
    }
};

exports.upsertItem = function(itemName, itemId, itemDef, cb) {
    const actName = "upsert";
    let collName = getCollName(itemName);
    let collKey = getCollKey(itemName);
    
    let dbResp = {
        nModified:0
    };
    
    if(!collName || !collKey) {
        dbResp.errMsg = util.format("Unknown item to %s %s", actName, itemName);
        cb(errEnum.ERR_INV_REQ, dbResp);
        return;
    }
    let cond = {};
    let newDoc = itemDef;
    
    let err = errEnum.ERR_NONE;
    let actMsg = util.format("%s %s", actName, collName);

    let parentItem = getParentContainer(itemName);
    if (parentItem) {
        newDoc.belongTo = {
            container:parentItem
        };
        newDoc.belongTo.refId = rectMatch(newDoc.rect, listCache[parentItem], getCollKey(parentItem));    
    }
    if (!('createTime' in newDoc)) {
        newDoc.createTime = new Date();
    }
    if (!itemId) {
        let sortOpt = {};
        sortOpt[collKey] = -1;
        let skpOpt = 0;
        let lmtOpt = 1;
        db.getRecords(collName, {}, sortOpt, skpOpt, lmtOpt)
        .then((lst)=>{
            dbg(actMsg, ", lst=", rst);
            if (Array.isArray(rst)){
                if(rst.length>0){
                    dbg("Latest ID:", rst[0][collKey]);
                    itemId = rst[0][collKey] + 1;
                }
                else {
                    dbg("Init Item ID");
                    itemId = 1;   
                }
                cond[collKey] = itemId;
                db.upsertRecords(collName, cond, newDoc)
                .then((rst)=>{
                    dbg(actMsg, ", rst=", rst);
                    if (1==rst.result.ok){
                        dbResp.nAdded = rst.upsertedCount;
                        dbResp.nModified = rst.modifiedCount;
                        save2Cache(itemName, collKey, itemId, newDoc);  
                    }
                    else {
                        err = errEnum.ERR_DB;
                    }
                    cb(err, dbResp);
                });
                return;
            }
            else {
                err = errEnum.ERR_DB;
            }
            cb(err, dbResp);
        })
        .catch((e)=>{
            dbg(actMsg, ", err=", e);
            dbResp.errMsg = e;
            cb(errEnum.ERR_EXCEPT, dbResp);
        });
    }
    else {
        cond[collKey] = itemId;
        db.upsertRecords(collName, cond, newDoc)
        .then((rst)=>{
            dbg(actMsg, ", rst=", rst);
            if (1==rst.result.ok){
                dbResp.nAdded = rst.upsertedCount;
                dbResp.nModified = rst.modifiedCount;
                save2Cache(itemName, collKey, itemId, newDoc);
            }
            else {
                err = errEnum.ERR_DB;
            }
            cb(err, dbResp);
        })
        .catch((e)=>{
            dbg(actMsg, ", err=", e);
            dbResp.errMsg = e;
            cb(errEnum.ERR_EXCEPT, dbResp);
        });
    }
};

exports.removeItem = function(itemName, itemId, cb) {
    const actName = "remove";
    let collName = getCollName(itemName);
    let collKey = getCollKey(itemName);
    let dbResp = {
        nRemoved:0
    };
    
    if(!collName || !collKey) {
        dbResp.errMsg = util.format("Unknown item to %s %s", actName, itemName);
        cb(errEnum.ERR_INV_REQ, dbResp);
        return;
    }
    let cond = {};
    cond[collKey] = itemId;
    
    let err = errEnum.ERR_NONE;
    let actMsg = util.format("%s %s", actName, collName);
    db.removeRecords(collName, cond)
    .then((rst)=>{
        dbg(actMsg, ", rst=", rst);
        if (1==rst.result.ok){
            dbResp.nRemoved = rst.deletedCount;
        }
        else {
            err = errEnum.ERR_DB;
        }
        cb(err, dbResp);
    })
    .catch((e)=>{
        dbg(actMsg, ", err=", e);
        dbResp.errMsg = e;
        cb(errEnum.ERR_EXCEPT, dbResp);
    });
};

exports.listItem = function(itemName, listOpt, cb) {
    const actName = "list";
    let collName = getCollName(itemName);
    // let collKey = getCollKey(itemName);
    let dbResp = {
        nTotal:0
    };
    
    if(!collName) {
        dbResp.errMsg = util.format("Unknown item to %s %s", actName, itemName);
        cb(errEnum.ERR_INV_REQ, dbResp);
        return;
    }
    let cond = {};
    if ('cond' in listOpt){
        cond = listOpt.cond;
    }
    let sortOpt = 0;
    if ('sortOpt' in listOpt){
        sortOpt = listOpt.sortOpt;
    }
    let lmtOpt = objLocCfg.dfltListLmt;
    if ('lmtOpt' in listOpt){
        lmtOpt = listOpt.lmtOpt;
    }
    let skpOpt = 0;
    if ('skpOpt' in listOpt){
        skpOpt = listOpt.skpOpt;
    }

    let err = errEnum.ERR_NONE;
    let actMsg = util.format("%s %s", actName, collName);
    db.getRecords(collName, cond, sortOpt, skpOpt, lmtOpt)
    .then((rst)=>{
        dbg(actMsg, ", rst=", rst);
        if (Array.isArray(rst)){
            dbResp.list = rst;
            dbResp.nTotal = rst.length;
        }
        else {
            err = errEnum.ERR_DB;
        }
        cb(err, dbResp);
    })
    .catch((e)=>{
        dbg(actMsg, ", err=", e);
        dbResp.errMsg = e;
        cb(errEnum.ERR_EXCEPT, dbResp);
    });
};

exports.checkFsmSt = function(procName) {
    if (procName in fsm) {
        return fsm[procName].st;
    }
    else {
        return stEnum.UNKNOWN;
    }
}