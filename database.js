var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var Promise = require('promise');

var con = console;

module.exports = (function() {

  con.log("database hello!!");

  var collection = null;

  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if (err) throw err;
    collection = db.collection('test_insert');
    con.log("database initialised!");
  });

  function followFriend(friend) {
    con.log("db followFriend", friend.screen_name);
    return new Promise(function(fulfill, reject) {
      if (collection) {
        collection.insert({friend: friend.id_str, date: new Date()}, function(err, docs) {
          if (err) {
            con.log("db followFriend reject err", err);
            reject(err);
          } else {
            fulfill(friend);
          }
        });
      } else {
        con.log("db followFriend reject no connection");
        reject("No connection");
      }
    });
  }

  function findFriend(friend) {
    con.log("db findFriend");
    return new Promise(function(fulfill, reject) {
      if (collection) {
        collection.find({
          friend: friend
        }).toArray(function(err, results) {
          if (err) {
            con.log("db findFriend reject err", err);
            reject(err);
          } else {
            fulfill(friend);
          }
        });
      } else {
        con.log("db findFriend reject no connection");
        reject("No connection");
      }
    });
  }

  return {
    findFriend: findFriend,
    followFriend: followFriend,
  }

})();