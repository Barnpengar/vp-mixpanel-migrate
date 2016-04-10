//To

//Token a3dcff528f32f194f5dda08ea5f665ad
//API Key 9e512ba5909bf1f6e2e6d8a18793f07f
//API Secret c8f9645b7cd7e23cac0562548709166f

// grab the Mixpanel factory
var Mixpanel = require('mixpanel');

// create an instance of the mixpanel client
var mixpanel = Mixpanel.init('a3dcff528f32f194f5dda08ea5f665ad');

var sendToMixPanel = function(doc) {
	doc = refit_keys(doc)
	doc = doc2MixpanelUser(doc)

    //Creating Users
	mixpanel.people.set(doc["$distinct_id"], doc);
	console.log("Creating user : " + doc["$distinct_id"])
    //console.log(doc)

	//Deleting users
	//mixpanel.people.delete_user(doc["$distinct_id"]);
	//console.log("Deleting user : " + doc["$distinct_id"])

	//Deleting one user
	//mixpanel.people.delete_user(4903);
	//console.log("Deleting user : " + doc["$distinct_id"])
}

var doc2MixpanelUser = function(doc) {
	temp = doc["$properties"]

    if(temp["$ios_devices"] != undefined)
    {
        var ios_devices = []
        Object.keys(temp["$ios_devices"]).forEach(key => {
            ios_devices.push(temp["$ios_devices"][key])
        })
        temp["$ios_devices"] = ios_devices
    }

	temp["$distinct_id"] = doc["$distinct_id"]
	return temp
}	

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
 
// Connection URL 
var url = 'mongodb://localhost:27017/local';
// Use connect method to connect to the Server 
MongoClient.connect(url, function(err, db) {
  // Get the documents collection 
  var collection = db.collection('peoples');
  // Find some documents 
  collection.find({}).toArray(function(err, docs) {
  	//docs = docs.filter((doc, index) => index < 1)
    docs.forEach(sendToMixPanel)
    db.close();
  });
});

var mapShortToLong = {
    "#properties": "$properties",
    "#distinct_id":  "$distinct_id",
    "#ios_devices":  "$ios_devices",
    "#predict_grade": "$predict_grade",
    "#last_seen" : "$last_seen",
    '#city': '$city',
    '#country_code': '$country_code',
    '#ios_app_release': '$ios_app_release',
    '#ios_app_version': '$ios_app_version',
    '#ios_device_model': '$ios_device_model',
    '#ios_lib_version': '$ios_lib_version',
    '#ios_version': '$ios_version',
    '#region': '$region',
    '#timezone': '$timezone',
    "#ios_ifa" : "$ios_ifa",
    "#email" : "$email",
    "phone_no" : "phoneNo",
    "birth_date" : "birthDate"
};


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
    }
    return build;
}
