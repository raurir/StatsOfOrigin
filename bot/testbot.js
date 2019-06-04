var _ = require("underscore");
var fs = require("fs");
var Promise = require('promise');

var socialbot = require('./TwitterSocialBot/socialbot');

var con = console;

var botID = "3194831798"; // your id

var client = socialbot.initClient({
  consumer_key: process.env.ORIGIN_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.ORIGIN_TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.ORIGIN_TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ORIGIN_TWITTER_ACCESS_TOKEN_SECRET,
});


function getMentions () {
  client.get('statuses/mentions_timeline', function(error, tweets, response){
    if(error) throw error;
    console.log("len", tweets.length);
    for (var i = tweets.length - 1; i >= 0; i--) {
      console.log(i, tweets[i].text);
    };
    // console.log(response);  // Raw response object.
  });
}

function listenToStream() {
  client.stream("statuses/filter", {track: "stateoforigin"}, function(stream) {
    stream.on("data", function(tweet) {

      if (tweet.user) {
        if (tweet.user.id_str === botID) {
          // con.log("Got an echo of myself!", tweet.text)
        } else {
          if (tweet.text) {
            con.log(tweet);
            con.log("=====================================");
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
      con.log(error);
    });
  });
}


function checkFollowers() {
  // socialbot.getFollowing(botID).then(f => {
  //   // con.log(f);
  //   fs.writeFileSync("following.json", JSON.stringify(f));

  //   // socialbot.getUserFromId(f[0])


  // });

  var json = JSON.parse(fs.readFileSync("following.json"));
  // con.log(json);
  var filter = {}
  var errors = {};
  var fileFilter = `filter${new Date().getTime()}.json`

  function getFollower(id) {
    return socialbot.getUserFromId(id).then(u => {
      // con.log(u);
      filter[id] = `${u.name} / ${u.screen_name} / ${u.description}`;
    });
  }


  var jsonIndex = 669;
  var delay = 1000;

  function nextFollower() {
    var userId = json[jsonIndex];
    getFollower(userId).then(()=>{
      // con.log(filter);
      delay = 1000;
      fs.writeFileSync(fileFilter, JSON.stringify(filter, "", "\t"));
      jsonIndex++;
      if (jsonIndex < json.length) {
        setTimeout(nextFollower, delay);
      }
    }).catch((err) => {
      delay *= 10;
      con.log("nextFollower err", err);
      if (err[0].code == 50) {
        con.log("user missing");
        jsonIndex++;
        setTimeout(nextFollower, delay);
        return;
      }
      con.log("nextFollower err - delaying", delay);
      // if (errors[userId]) {
      //   errors[userId]++;
      // } else {
      //   errors[userId] = 1;
      // }
      // if (errors[userId] == )
      setTimeout(nextFollower, delay);
    });  
  }

  // nextFollower();
}
// var json = JSON.parse(fs.readFileSync("filter-bad.json"));
// con.log(json);
// var arr = [];
// _.each(json, (v, k) => arr.push({id: k, details: v}));
// con.log(arr);
// var arr = json;

// var bad = _.filter(arr, (user) => {
//   return /(league|nrl)/i.test(user.details) == false;
// });

// con.log(bad.length);
// var bad = json.map((u) => u.id);
// fs.writeFileSync("filter-bad-ids.json", JSON.stringify(bad, "", "\t"));

// con.log(bad);





function pruneFollowers() {

  var json = JSON.parse(fs.readFileSync("prune-progress.json"));
  var delay = 1000;

  function nextFollower() {
    var userId = json[0];
    socialbot.unfollowFriend(userId).then(()=>{
      // con.log(filter);
      var removed = json.shift();
      con.log(json.length, userId, removed);
      fs.writeFileSync("prune-progress.json", JSON.stringify(json, "", "\t"));
      delay = 1000;
      if (json.length) {
        setTimeout(nextFollower, delay);
      }
    }).catch((err) => {
      delay *= 10;
      con.log("nextFollower err", err);
      if (err[0].code == 50) {
        con.log("user missing");
        setTimeout(nextFollower, delay);
        return;
      }
      con.log("nextFollower err - delaying", delay);
      // if (errors[userId]) {
      //   errors[userId]++;
      // } else {
      //   errors[userId] = 1;
      // }
      // if (errors[userId] == )
      setTimeout(nextFollower, delay);
    });  
  }

  nextFollower();
}

pruneFollowers();




