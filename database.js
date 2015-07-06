var MongoClient = require('mongodb').MongoClient;
// var format = require('util').format;
var Promise = require('promise');

var con = console;


/*
launch database:
mongod --dbpath data/db

export database:
mongoexport --host 127.0.01 --db test --collection test_insert --out test.json
*/

module.exports = (function() {

  var collection = null;

  function init() {
    // con.log("Database connect"); 
    return new Promise(function(fulfill, reject) {
      MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
        if (err) {
          con.log("database.connect rejected", err);
          reject(err);
        } else {
          collection = db.collection('test_insert');
          fulfill();
        }
      });
    });
  }

  function followFriend(friend) {
    // con.log("db followFriend", friend.screen_name);
    return new Promise(function(fulfill, reject) {
      if (collection) {
        collection.insert({friend: friend.id_str, dateFollowed: new Date()}, function(err, docs) {
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
    // con.log("db findFriend");
    friend = String(friend);
    return new Promise(function(fulfill, reject) {
      if (collection) {
        collection.find({
          friend: friend
        }).toArray(function(err, results) {
          if (err) {
            con.log("db findFriend reject err", err);
            reject(err);
          } else {
            con.log("db findFriend results - dateUnfollowed:", friend, results[0].dateUnfollowed);
            fulfill(friend);
          }
        });
      } else {
        con.log("db findFriend reject no connection");
        reject("No connection");
      }
    });
  }


  function updateFriend(friend) {
    friend = String(friend);
    // con.log("db updateFriend");
    return new Promise(function(fulfill, reject) {
      if (collection) {
        try {
          collection.update(
            { friend: friend},
            {
              $set: {
                dateUnfollowed: new Date()
              }
            }
          );
          // con.log("db updateFriend response");
          fulfill(friend);
        } catch(err) {
          con.log("db updateFriend err", err);
          reject(err);
        }
      } else {
        con.log("db updateFriend reject no connection");
        reject("No connection");
      }
    });
  }



  function getFollowedHistory() {
    return new Promise(function(fulfill, reject) {
      if (collection) {

        try { // coz we suck at sql...

          var d = new Date();
          var then = d.getTime();
          d.setDate(d.getDate() - 7); 

          collection.find({
            dateFollowed: {"$lt": d},
            dateUnfollowed: {"$exists": false} // make sure we don't unfollow previous unfollows
          }).toArray(function(err, results) {
            if (err) {
              con.log("db getFollowedHistory reject err", err);
              reject(err);
            } else {
              // con.log("db getFollowedHistory fulfill - following:", results.length);
              var proctime = new Date().getTime() - then;
              // con.log("db getFollowedHistory proctime", proctime);
              fulfill(results);
            }
          });

        } catch(err) {
          con.log("getFollowedHistory error", err);
        }

      } else {
        con.log("db getFollowedHistory reject no connection");
        reject("No connection");
      }
    });
  }




  function hasBeenFollowed(friend) {
    friend = String(friend);
    return new Promise(function(fulfill, reject) {
      if (collection) {
        try {
          collection.find({
            friend: friend
          }).toArray(function(err, results) {
            if (err) {
              con.log("db hasBeenFollowed reject err", err);
              reject(err);
            } else {
              fulfill(results.length > 0);
            }
          });

        } catch(err) {
          con.log("hasBeenFollowed error", err);
        }

      } else {
        con.log("db hasBeenFollowed reject no connection");
        reject("No connection");
      }
    });
  }







  function doAdd() {
    // populate existing...
    var toInsert = following.slice(1*1000,2*1000).map(function(a) {
      var d = new Date();
      d.setDate(d.getDate() - 4);
      return {friend: String(a), dateFollowed: d};
    });

    con.log(toInsert.length);

    // return;
    collection.insert(toInsert, function(err, docs) {
      if (err) {
        con.log("db followFriend reject err", err);
      } else {
        con.log("ok", docs.result);
      }
    });
    con.log("add");
  }

  // setTimeout(doAdd, 100);


  return {
    init: init,
    findFriend: findFriend,
    followFriend: followFriend,
    getFollowedHistory: getFollowedHistory,
    hasBeenFollowed: hasBeenFollowed,
    updateFriend: updateFriend,
  }

})();