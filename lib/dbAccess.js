let config = require('config');
let util = require('util');
let mongoClient = require('mongodb').MongoClient;
let dbg = require('debug')('dbAccess');
let mdbClient;
let dbName;
let db;
let connStr;
let connOpt;

exports.init = function(dbCfg, db) {
    const user = encodeURIComponent(dbCfg.user);
    const password = encodeURIComponent(dbCfg.pswd);
    let dbRaw =  dbCfg.database;

    if( ("string" == typeof db) && (db.length>0) ){
        dbRaw = db;
    }
    dbName = encodeURIComponent(dbRaw);
    
    const authMechanism = 'DEFAULT';

    connStr = util.format("mongodb://%s:%s@%s/%s"
        , user, password, dbCfg.host, dbName);
    connOpt = dbCfg.connOpt;
    dbg("url=", connStr);
    dbg("dbCfg.connOpt=", connOpt);
};

let connDB = function(caller) {
    if (mdbClient){
        dbg(caller, "=>ConnDB():", mdbClient.isConnected());    
    }
    else {
        dbg(caller, "=>ConnDB(): NULL");   
    }
    return new Promise((resolve, reject) => {
        mongoClient.connect(connStr, connOpt)
        .then((client)=>{
            mdbClient = client;
            db = mdbClient.db(dbName);
            dbg("Connected to DB:",dbName);
            resolve(null);
        })
        .catch((err)=>{
            dbg("ConnDB Error:", err);
            reject(err);
        });
    });
};

let disconnDB = function(caller) {
    dbg(caller, "=>disconnDB():", mdbClient.isConnected());
    return new Promise((resolve, reject) => {
        mdbClient.close()
        .then(()=>{
            dbg(caller, ":closed connection:",dbName);
            resolve();
        })
        .catch((err)=>{
            dbg(caller, ":failed to close connection:",dbName);
            reject(err);
        });
    });
};

async function _checkStatus() {
    try{
        await connDB("_checkStatus");
        await disconnDB("_checkStatus");
        return null;
    } catch (err) {
        console.log("_checkStatus(): error=", err);
        throw error;
    }
};

async function _addRecords(collName, docs) {
    try{
        await connDB("_addRecords");
        let coll = db.collection(collName);
        let rst = await coll.insertMany(docs);
        await disconnDB("_addRecords");
        return rst;
    } catch (err) {
        console.log("_addRecords(): error=", err);
        if (mdbClient.isConnected()) {
            await disconnDB("_addRecords");
        }
        throw err;
    }
};

async function _getRecords(collName, cond, opt) {
    try{
        await connDB("_getRecords");
        dbg('_getRecords(): cond=', cond, "opt=", opt);
        let coll = db.collection(collName);
        // Get the cursor
        const cursor = coll.find(cond, opt)
        rst = [];
        // Iterate over the cursor
        while(await cursor.hasNext()) {
          const doc = await cursor.next();
          dbg(doc);
          rst.push(doc);
        }
        await disconnDB("_getRecords");
        return rst;
    } catch (err) {
        console.log("_getRecords(): error=", err);
        if (mdbClient.isConnected()) {
            await disconnDB("_getRecords");
        }
        throw err;
    }
};

async function _upsertRecords(collName, cond, newDocs) {
    let funcName = "_updateRecords";
    try{
        await connDB(funcName);
        let coll = db.collection(collName);
        let opt = {upsert: true};
        let rst = await coll.updateMany(cond, {$set: newDocs}, opt);
        await disconnDB(funcName);
        return rst;
    } catch (err) {
        console.log("_upsertRecords(): error=", err);
        if (mdbClient.isConnected()) {
            await disconnDB("_upsertRecords");
        }
        throw err;
    }
};

async function _removeRecords(collName, cond) {
    let funcName = "_removeRecords";
    try{
        await connDB(funcName);
        let coll = db.collection(collName);
        // let opt = {upsert: true};
        let rst = await coll.deleteMany(cond);
        await disconnDB(funcName);
        return rst;
    } catch (err) {
        console.log(funcName, "(): error=", err);
        if (mdbClient.isConnected()) {
            await disconnDB(funcName);
        }
        throw err;
    }
};

exports.checkStatus = function(cb) {
    return new Promise((resolve, reject) => {
        _checkStatus()
        .then(()=>{
            resolve();
        })
        .catch((err)=>{
            reject(err);
        });
    });
};

exports.addRecords = function(collName, doc) {
    let docs = [];
    if (Array.isArray(doc)) {
        docs = doc;
    }
    else {
        docs.push(doc);
    }
    return new Promise((resolve, reject) => {
        _addRecords(collName, docs)
        .then((rst)=>{
            resolve(rst);
        })
        .catch((err)=>{
            reject(err);
        });
    });
};

exports.upsertRecords = function(collName, cond, newDoc) {
    return new Promise((resolve, reject) => {
        _upsertRecords(collName, cond, newDoc)
        .then((rst)=>{
            resolve(rst);
        })
        .catch((err)=>{
            reject(err);
        });
    });
};

exports.getRecords = function(collName, cond, srt, skip, lmt) {
    let opt = {};
    if ('object' == typeof srt){
        opt.sort = srt;    
    }
    if ( ('number' == typeof skip) && (skip>=0) ){
        opt.skip = skip;    
    }
    if ( ('number' == typeof lmt) && (lmt>0) ){
        opt.limit = lmt;    
    }
    dbg('opt=', opt);
    return new Promise((resolve, reject) => {
        _getRecords(collName, cond, opt)
        .then((rst)=>{
            resolve(rst);
        })
        .catch((err)=>{
            reject(err);
        });
    });
};

exports.removeRecords = function(collName, cond) {
    return new Promise((resolve, reject) => {
        _removeRecords(collName, cond)
        .then((rst)=>{
            resolve(rst);
        })
        .catch((err)=>{
            reject(err);
        });
    });
};