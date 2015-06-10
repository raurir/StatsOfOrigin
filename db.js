var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
var con = console;

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if(err) throw err;

    var collection = db.collection('test_insert');
    collection.insert({a: Math.round(Math.random() * 10)}, function(err, docs) {
        collection.count(function(err, count) {
            console.log(format("count = %s", count), count);
        });
    });

    // Locate all the entries using find
    // collection.find().toArray(function(err, results) {
    //     console.dir("results ?", results);
    //     // Let's close the db
    //     // db.close();
    // });


    setTimeout(function() {

    	con.log("users", db.records);

	    collection.find({
	    	a: 2
	    }).toArray(function(err, results) {
	        console.log(results, typeof results);
	        // Let's close the db
	        // db.close();
	    });

    }, 20);

});