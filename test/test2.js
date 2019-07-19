let db = require("../lib/dbAccess");
let config = require('config')
let dbCfg = config.get('srv.mdb');

process.on('unhandledRejection', (err) => { 
  console.error(err)
  process.exit(1)
});

db.init(dbCfg);
(async function() {
    try {
        await db.checkStatus();
        let cond = {
            x:881
            // x:{$gt:800}
        }
        let limit = 3
        let sort = {y:-1};
        let skip = 0;
        let newDoc = {
            y:875
        }

        // rst = await db.getRecords(
        // rst = await db.upsertRecords(
        rst = await db.removeRecords(
            "test2"
            ,cond
        //    ,sort
        //    ,skip
        //    ,limit
        //    , newDoc
            );
        console.log("succ, rst=", rst);  
    }
    catch(err) {
        console.log("Error:", err);
    };
    return;
})();