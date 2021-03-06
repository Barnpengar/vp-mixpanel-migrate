//From

//Token bde7c5953378855d9dc41703d676d32a
//API Key adf2e5762fba49a0e9908a87c21127f4
//API Secret a3dfabf7942edf0ac0747d45f1ea7659


//To

//Token c396e4e0c7f42685eab2cd6308d75982
//API Key 95bd86c6dfdd764640fb23d512ea50df
//API Secret 1e65d15d48090928a967b185c2edc320

var jsonfile = require('jsonfile')
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var MONGO_DB_URL = 'mongodb://localhost:27017/local';
var fs = require('fs')
// Use connect method to connect to the Server

//initialize with required api_key and api_secret
var Mixpanel_Exporter = require('node-mixpanel-data-exporter')
mixpanel_exporter = new Mixpanel_Exporter({
  api_key: '95bd86c6dfdd764640fb23d512ea50df'
, api_secret: '1e65d15d48090928a967b185c2edc320'
, format: 'json' //optional and will default to json
})

var args = jsonfile.readFileSync('args.json')

//console.log("args")
//console.log(args)
mixpanel_exporter.fetch('engage', args, function(error, request, body) {
    var json = JSON.parse(body)
    var session_id = json.session_id
    var page = json.page
    var documents = json.results
    documents = cleanDocuments(json.results)
    //uploadDocuments(documents, session_id, page)
    documents.forEach((item) => logRegionInfoForDocument(item, session_id, page))
})

var logRegionInfoForDocument = (item, session_id, page) => {
  if(!!item["#distinct_id"] && !!item["#properties"]["#city"])
    console.log(`${item["#distinct_id"]},${item["#properties"]["#city"]}, ${item["#properties"]["#region"]}`)
  jsonfile.writeFileSync("args.json", {session_id : session_id, page : page + 1})
}

var cleanDocuments = function(documents) {
    documents = documents.map(refit_keys)
    return documents.reduce((a,b) => {
        if(b["#distinct_id"].length > 8 || b["#properties"].name == undefined)
            return a


        if(b["#properties"].is_child)
            b["#properties"].scope = "child"

        if(b["#properties"].is_parent)
            b["#properties"].scope = "parent"

        if(b["#properties"].is_child !== undefined)
            delete b["#properties"].is_child
        if(b["#properties"].is_parent !== undefined)
            delete b["#properties"].is_parent
        if(b["#properties"].humanId)
            delete b["#properties"].humanId

        if(typeof b["#properties"]["#email"] !== "string")
            delete b["#properties"]["#email"]

        if(typeof b["#properties"]["phoneNo"] !== "string")
            delete b["#properties"]["phoneNo"]

        if(typeof b["#properties"]["birthDate"] !== "string")
            delete b["#properties"]["birthDate"]

        if(b["#properties"]["#ios_devices"] == undefined)
            delete b["#properties"]["#ios_devices"]

        //console.log(b)
        return a.concat(b)
    },[])
}

var mapShortToLong = {
    "$properties": "#properties",
    "$distinct_id":  "#distinct_id",
    "$ios_devices":  "#ios_devices",
    "$predict_grade": "#predict_grade",
    "$last_seen" : "#last_seen",
    '$city': '#city',
    '$country_code': '#country_code',
    '$ios_app_release': '#ios_app_release',
    '$ios_app_version': '#ios_app_version',
    '$ios_device_model': '#ios_device_model',
    '$ios_lib_version': '#ios_lib_version',
    '$ios_version': '#ios_version',
    '$region': '#region',
    '$timezone': '#timezone',
    "$ios_ifa" : "#ios_ifa",
    "$email" : "#email",
    "$deliveries" : "#deliveries",
    "$bounce_category" : "#bounce_category",
    "$android_app_version" : "#android_app_version",
    "$android_app_version_code" : "#android_app_version_code",
    "$android_brand" : "#android_brand",
    "$unsubscribed" : "#unsubscribed",
    "$android_lib_version" : "#android_lib_version",
    "$android_devices" : "#android_devices",
    "$android_manufacturer" : "#android_manufacturer",
    "$android_model" : "#android_model",
    "$bounce_notification" : "#bounce_notification",
    "$android_os" : "#android_os",
    "$android_os_version" : "#android_os_version",
    "$bounced" : "#bounced",
    "email" : "#email",
    "$campaigns" : "#campaigns",
    "phone_no" : "phoneNo",
    "birth_date" : "birthDate"
};

var keysToDelete = {
    transactions : false,
    permissions : false,
    notifications : false,
    children : false,
    devices  : false,
    ios_devices : false,
    allowance : false,
    iosDevices : false,
    tasks : false,
    savingsAccount : false,
    profileImage : false,
    parents : false,
    transactionalAccount : false,
    inviteCountdownTimestamp : false,
    hasSignedIn : false,
    goals : false
}

function refit_keys(o){
    var build, key, destKey, ix, value;

    build = {};
    for (key in o) {
        // Get the destination key
        destKey = mapShortToLong[key] || key;

        // Get the value
        value = o[key];

        // If this is an object, recurse
        if (typeof value === "object") {
            value = refit_keys(value);
        }

        // Set it on the result using the destination key
        build[destKey] = value;

        if(keysToDelete[destKey] === false)
            delete build[destKey]
    }
    return build;
}


//after running this: Byta namn på Cities - Södra förstaden -> Malmö, Ringön -> Göteborg
var uploadDocuments = function(documents, session_id, page) {
	MongoClient.connect(MONGO_DB_URL, function(err, db) {
	  assert.equal(null, err);
	  console.log("Connected correctly to server");
	  var collection = db.collection('peoples');
	  collection.insertMany(documents, function(err, result) {
	  	if(err)
	  		console.log(err)
	  	else
	    	console.log("Inserted " + result.ops.length + " documents into the document collection");
	    db.close();
        jsonfile.writeFileSync('args.json', {session_id : session_id, page : page+1})
	  });
	})
}
