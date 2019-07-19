let fs=require('fs');

let camDB = [ 
    {
        urlBase: "http://192.168.1.108/cgi-bin/ptz.cgi"
        ,make:"dahua"
        ,user:"mrview"
        ,pswd:"tnqVIEW32!"
    }
    ,{
        urlBase: "http://192.168.55.145/cgi-bin/ptz.cgi"
        ,make:"dahua"
        ,user:"mrview"
        ,pswd:"tnqVIEW32!"
    }
    ,{
        urlBase: "http://192.168.13.56/cgi-bin/ptz.cgi"
        ,make:"dahua"
        ,user:"mrview"
        ,pswd:"tnqVIEW32"
    } 
];

exports.init = function(dbCfg, cb) {
    cb(null);
}

/* read a camemra's configuration using it camID */
exports.readCam = function(camID, cb){
    return camDB[camID];
};

/* list both ID and note of each camera */
exports.listCam = function(camID, ptzCfg,  cb){
}


/* add a camera configuration to cam DB */
exports.addCam = function(camCfg,  cb){

}

/* delete a camera configuration from cam DB */
exports.delCam = function(camCfg,  cb){

}

/* load a list of cameras from DB */
exports.loadCamDb = function(cb){

}

/* save the current list of cameras into DB */
exports.saveCamDb = function(cb){

}