var _ = require("underscore");
var database = require('./database');
var fs = require("fs");
var Promise = require('promise');
var socialbot = require('./TwitterSocialBot/socialbot');
var Twitter = require("twitter");

var con = console;

module.exports = function(options) {

  var botID = null, client = null, db = null;

  var lastSave = new Date().getTime();
  var lastFollow = 0;//new Date().getTime();

  function initClient() {
    client = socialbot.initClient(options.twitter);
  }

  function initDB() {
    if (!db) {
      // con.log("initDB calling connect");
      database.init(options.database).then(function() {
        con.log("initDB connected");
        db = true;
      });
    }
  }

  function initStream() {
    initDB();
    initClient();
    con.log("initStream");

    if (options.term) {

      client.stream("statuses/filter", {track: options.term}, function(stream) {
        stream.on("data", function(tweet) {

          if (tweet.user) {
            if (tweet.user.id_str === botID) {
              // con.log("Got an echo of myself!", tweet.text)
            } else {

              if (tweet.text) {
                // con.log("stream(user) - ok - tweet.text", tweet.text);

                var now = new Date().getTime();

                var minute = 1000 * 60;
                var hour = minute * 60;
                var day = hour * 24;


                var badText = false;
                var badUser = false;
                if (options.bad ) {
                  if (options.bad.text) {
                    badText = options.bad.text.test(tweet.text);
                  }
                  if (options.bad.users) {
                    badUser = options.bad.users.indexOf(tweet.user.screen_name) > -1;
                  }
                }
                var bad = badText || badUser;

                // con.log("=====================================");
                // con.log(badUser, badText, tweet.user.screen_name, ": ", tweet.text);

                if (!bad) {
                  // con.log("-------------------------------------");
                  // con.log(tweet);
                  // con.log("=====================================");

                  var item = {
                    "bad": bad,
                    "id_str": tweet.id_str,
                    "text": tweet.text,
                    "user_id_str": tweet.user.id_str,
                    "user_screen_name": tweet.user.screen_name,
                    "user_profile_image_url": tweet.user.profile_image_url,
                    "retweeted": tweet.retweeted,
                  };
                  options.history.push(item);


                  // if (tweet.retweet_count || tweet.favorite_count) {
                  //   con.log("popular tweet...");
                  // } else {
                  //   con.log("not popular", tweet.retweet_count, tweet.favorite_count);
                  // }

                  // con.log("found tweet", tweet.user.name, tweet.text);

                  if (true || tweet.user.followers_count < 100) {
                    // con.log("found user with no mates", tweet.user.name, tweet.text);

                    var friend = tweet.user.id_str;
                    database.hasBeenFollowed(friend).then(function(hasBeen) {
                      if (hasBeen) {
                        con.log("* followed already!", friend, tweet.user.name, tweet.text);
                      } else {
                        if (now - lastFollow > minute * 2) {


                          con.log("# following friend!!", new Date().getHours() + ":" + new Date().getMinutes(), friend, tweet.user.name, tweet.text);
                          socialbot.followFriend(friend)
                          .then(database.followFriend)
                          .then(function() {
                            /*
                            con.log("calling checkFollowers");
                            checkFollowers();
                            setTimeout(checkFollowers, 10000);
                            */
                            return true;
                          })
                          .catch(handleError);



                          lastFollow = now;

                        } else {
                          con.log("% too soon!", friend, tweet.user.name, tweet.text);
                        }
                      }
                    }).catch(handleError);

                  }

                }



                if (now - lastSave > day || options.history.length > 100) {
                  writeLog("history", JSON.stringify(options.history));
                  lastSave = now;
                  options.history = [];
                }



              } else if (tweet.friends) {
                // con.log("stream(user) - initial tweet - friends:", tweet.friends.length);
              } else {
                // con.log("stream(user) - unknown tweet", tweet);
              }

            }

          }
        });

        stream.on("error", function(error) {
          // throw error;
          con.log("Stream error:", error);
        });
      });



    } else {
      con.log("initStream called with no options.term...");
    }

  }




  function initSocial() {
    initClient();
    initDB();
    con.log("initSocial");

    // socialbot.getFollowing().then(function(friends) {
    //   con.log("friends length:", friends.length);
    //   con.log("friends:", friends);
    // });

    // socialbot.getFollowers().then(function(followers) {
    //   con.log("followers", followers.ids.length, followers.next_cursor, followers.previous_cursor);
    // });

    // doItAgain();
    doIt();

  }







  function checkFollowers() {
    con.log("checkFollowers");
    socialbot.getFollowers().then(function(followers) {
      con.log("followers", followers.ids.length);// , followers.next_cursor, followers.previous_cursor);

      database.getFollowedHistory()
      .then(function(following) {
        return arrayPickSome(following, 10);
      })
      .then(function(selectedFollowing) {

        // checking which following are also followers
        var toPrune = [];
        for (var i = 0; i < selectedFollowing.length; i++) {
          var followingId = Number(selectedFollowing[i].friend);
          if (followers.ids.indexOf(followingId) === -1) {
            // con.log("This guy  me", followingId, typeof followingId);
            toPrune.push(followingId);
          } else {
            con.log("This guy IS following me", followingId);
          }
        };
        // con.log("OriginBot getFollowedHistory", selectedFollowing.length, toPrune);
        return toPrune[0];

      })
      .then(socialbot.unfollowFriend)
      .then(database.updateFriend)
      .then(database.findFriend) // just a verify loop...
      .then(function() {
        // doInSpecificMinutes(0.2);

        con.log("========================");
      }).catch(handleError);

    });

  }


  function findFriend() {
    con.log("findFriend");
    now = new Date();

    socialbot.getFollowing(null)
    .then(function(friends) {
      return new Promise(function(fulfill, reject) {
        con.log("time", now.getHours() + ":" + now.getMinutes(), "friends", friends.length);
        fulfill(friends);
      });
    })
    .then(randIndex)
    .then(socialbot.getFollowing)
    .then(randIndex)

    .then(function(friend) {
      con.log("friend to follow:", friend);
      return friend;
    })

    .then(socialbot.followFriend)
    .then(database.followFriend)
    .then(doItAgain)
    .catch(handleError);
  }


  // util functions
  function randIndex(arr) {
    return new Promise(function(fulfill, reject) {
      try {
        var item = arr[Math.floor(Math.random() * arr.length)];
        fulfill(item);
      } catch (e) {
        con.log("randIndex error", e);
        reject(e);
      }
    });
  }

  function arrayPickSome(source, required) {
    // con.log("calling arrayPickSome");
    return new Promise(function(fulfill, reject) {
      source = source.slice();
      if (source.length && required) {
        var good = [], iterations = 0, maxIterations = 2000;
        while (good.length < required && source.length && iterations < maxIterations) {
          var index = Math.floor(Math.random() * source.length);
          var item = source.splice(index, 1)[0];
          good.push(item);
          // con.log("arrayPickSome", index, item, good.length);
          iterations ++;
        }
        if (iterations >= maxIterations) {
          con.warn("arrayPickSome - Too many iterations");
          reject([]);
        } else {
          // con.log("arrayPickSome - good:", good.length);
          fulfill(good);
        }
      } else {
        if (!source.length) con.log("arrayPickSome - source array was empty");
        if (!required) con.log("arrayPickSome - required amount was falsey", required);
        fulfill([]);
      }
    });
  }











  var doItCallback = null;
  function doIt() {
    // findFriend();
    con.log("doIt");
    if (db) {
      checkFollowers();
    } else {
      setTimeout(doIt, 100);
    }
  }

  function doItAgain() {
    var delayMins = Math.round((2 + Math.random() * 2) * 100) / 100;
    doInSpecificMinutes(delayMins);
  }

  function doInSpecificMinutes(delayMins) {
    var delay = delayMins * 60 * 1000;
    // con.log("doInSpecificMinutes in minutes", delayMins, delay);
    setTimeout(doIt, delay);
  }





  function handleError(err) {
    if (err === "TOO_MANY" || err === "NO_FRIENDS") {
      con.log("Custom error, trying again... in 10 seconds", err);
      doInSpecificMinutes(0.1);
    } else {
      if (err[0] && err[0].code) {
        switch (err[0].code) {
          case 34 :
            con.log("Known error -- page does not exist", err);
            doInSpecificMinutes(1);
            break;
          case 88 :
            con.log("Known error -- too many hits, waiting", err);
            doInSpecificMinutes(15);
            break;
          case 108 :
            con.log("Known error -- tried to follow someone who doesn't exist", err);
            doInSpecificMinutes(20);
            break;
          case 250 :
            con.log("Known error -- tried to follow someone with age restriction", err);
            doInSpecificMinutes(5);
            break;
          default :
            con.log("Unknown error -- writing log", err);
            writeLog("error", JSON.stringify(err));
        }
      } else {
        con.log("handleError error - no code", err);
        writeLog("error", JSON.stringify(err));
      }
    }
  }







  function writeLog(filename, content) {
    var d = new Date();
    var time = [d.getUTCFullYear(), (d.getUTCMonth()+1), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()].join("-");
    saveFile("/history/" + filename + "-" + time + ".json", content);
  }

  function saveFile(filename, content) {
    fs.writeFile(__dirname + filename, content, function(err) {
      if(err) {return con.log(err);}
    });
  };


  if (options.start) {
    if (options.start.stream) initStream();
    if (options.start.social) initSocial();
  } else {
    con.log("no options.start passed in!");
  }

}