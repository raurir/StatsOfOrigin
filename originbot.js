var Twitter = require("twitter");
var _ = require("underscore");
var fs = require("fs");
var http = require("http");
var https = require("https");
var Promise = require('promise');
var request = require("request");
var express = require('express');

var socialbot = require('./TwitterSocialBot/socialbot');

var con = console;

var lastSave = new Date().getTime();

var history = [];

function saveFile(filename, content) {
  // con.log("self.saveFile writing:", filename);
  lastSave = new Date().getTime();
  fs.writeFile(__dirname + filename, content, function(err) {
    if(err) {
        return con.log(err);
    }
    con.log("self.saveFile complete:", filename, new Date().getTime() - lastSave);
  });
};

function initServer() {
  con.log("initServer");

  var output = process.env.OUTPUT_URL;
  var self = {};
  if (/rauri/.test(process.env.USER)) {
    self.port = 8020;
    self.ipaddress = "127.0.0.1";
  } else if (/root/.test(process.env.USER)) {
    self.port = 8020;
    self.ipaddress = "0.0.0.0";
  } else {
    throw new Error("unknown environment");
  }

  var htmlHeader = "<html><header><link rel=\"stylesheet\" type=\"text/css\" href=\"/bot.css\"></header><body>";
  var links = "<div class='links'>" + ["memory", "history"].map(function(link,i) { return "<a href='" + output + link + "'>" + link + "</a>"; }).join(" ") + "</div>";
  var htmlFooter = "</body></html>";


  function renderTweet(item, index) {
    return [
      "<div class='tweet " + (item.bad ? "bad" : "good") + "'>",
        "<div class='index'>", index, "</div>",
        "<div class='image'>",
          "<a href='http://twitter.com/" + item.user_screen_name + "'>",
            "<img src='" + item.user_profile_image_url + "'>",
          "</a>",
        "</div>",
        "<div class='text'>",
          "<div class='retweeted'>", (item.retweeted ? "RT!" : ""), "</div>",
          "<a href='http://twitter.com/statuses/" + item.id_str + "'>", item.text, "</a>",
        "</div>",
      "</div>"
    ].join("");
  }






  self.routes = { };

  self.routes["/bot.css"] = function(req, res) {
    fs.readFile(__dirname + '/bot.css', function (err, data) {
      res.writeHead(200, {'Content-Type': 'text/css'});
      res.write(data);
      res.end();
    });
  };

  self.routes[output + "memory/"] = function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    var historyString = history.map(renderTweet).join("");
    res.send(htmlHeader + "<h4>Memory</h4>" + links + "Items:" + history.length + "<br>" + historyString + htmlFooter);
  };

  self.routes[output + "history/"] = function(req, res) {
    var files = fs.readdirSync(__dirname + "/history/");
    // con.log(files);
    var fileLinks = files.map(function(file,i) {
      return "<a href='" + output + "history/show/" + file + "'>" + file + "</a>";
    });
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlHeader + "<h4>History</h4>" + links + fileLinks.join("<br>") + htmlFooter);
  };

  self.routes[output + "history/show/:file"] = function(req, res) {
    var filename = __dirname + "/history/" + req.params.file;
    // res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Type', 'text/html');
    self.readJSON(filename).then(function(data) {
      return new Promise(function(fulfill, reject) {
        var loadedHistory = JSON.parse(data).map(renderTweet).join("");
        res.end(htmlHeader + "<h4>History</h4>" + links + loadedHistory + htmlFooter);
        // res.end(data);
        fulfill();
      });
    });
  };


  self.readJSON = function(filename) {
    return new Promise(function(fulfill, reject) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          reject(err);
        } else {
          fulfill(data);
        }
      });
    });
  }








  self.app = express();

  var server = http.createServer(self.app);

  for (var r in self.routes) {
    self.app.get(r, self.routes[r]);
  }
  self.app.listen(self.port, self.ipaddress, function() {
    con.log('%s: Node server started on %s:%d ...', Date(Date.now() ), self.ipaddress, self.port);
  });

}

function initBot() {
  con.log("initialising bot");

  var botID = null, client = null;

  function initClient() {
    client = socialbot.initClient({
      consumer_key: process.env.ORIGIN_TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.ORIGIN_TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.ORIGIN_TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.ORIGIN_TWITTER_ACCESS_TOKEN_SECRET,
    });
  }

  function initStream() {
    initClient();
    con.log("initialising twitter stream");

    client.stream("statuses/filter", {track: "stateoforigin"}, function(stream) {
      stream.on("data", function(tweet) {

        if (tweet.user) {
          if (tweet.user.id_str === botID) {
            // con.log("Got an echo of myself!", tweet.text)
          } else {

            if (tweet.text) {
              // con.log("stream(user) - ok - tweet.text", tweet.text);

              var badText = (/(RT|loan|→|Poll)/.test(tweet.text));
              var badUser = ["johnspatricc", "aunewse", "l5iza", "gima2327"].indexOf(tweet.user.screen_name) > -1;
              var bad = badText || badUser;

              // con.log("=====================================");
              con.log(badUser, badText, tweet.user.screen_name, ": ", tweet.text);
              // con.log("-------------------------------------");
              // con.log(tweet);
              con.log("=====================================");

              if (!bad) {
                var item = {
                  "bad": bad,
                  "id_str": tweet.id_str,
                  "text": tweet.text,
                  "user_id_str": tweet.user.id_str,
                  "user_screen_name": tweet.user.screen_name,
                  "user_profile_image_url": tweet.user.profile_image_url,
                  "retweeted": tweet.retweeted,
                };
                history.push(item);
              }


              var now = new Date().getTime();
              var minute = 1000 * 60;
              var hour = minute * 60;
              var day = hour * 24;
              if (now - lastSave > day || history.length > 100) {
                var d = new Date();
                var time = [d.getUTCFullYear(), (d.getUTCMonth()+1), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()].join("-");
                saveFile("/history/history-" + time + ".json", JSON.stringify(history));
                history = [];
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
        con.log(error);
      });
    });

    con.log("Bot running...");
  }




  function initSocial() {

    function doIt() {
      now = new Date()
      con.log("time", now.getHours() + ":" + now.getMinutes())
      socialbot.getFriends()
      .then(randIndex)
      .then(socialbot.getFriends)
      .then(function(friends) {
        return new Promise(function(fulfill, reject) {
          if (friends.length > 500) {
            reject("TOO_MANY");
          } else {
            fulfill(friends);
          }
        });
      })
      .then(randIndex)

      // .then(function(friend) { con.log("friend:", friend); })

      .then(socialbot.followFriend)
      .then(doItAgain)

      .catch(function(err) {
        if (err === "TOO_MANY") {
          con.log("known error, trying again... in 10 seconds", err);
          doItAgain(0.1);
        } else {
          if (err[0] && err[0].code && err[0].code == 88) {
            con.log("Known error -- too many hits, waiting 15 mins", err);
            doItAgain(15);
          } else {
            con.log("doIt error", err);
          }
        }
      });
    }

    function doItAgain(delayMins) {
      delayMins = delayMins || Math.round((3 + Math.random() * 3) * 100) / 100;
      var delay = delayMins * 60 * 1000;
      con.log("doItAgain in minutes", delayMins, delay);
      setTimeout(doIt, delay);
    }

    function randIndex(arr) {
      return new Promise(function(fulfill, reject) {
        try {
          var item = arr[Math.round(Math.random() * arr.length)];
          fulfill(item);
        }catch (e) {
          con.log("randIndex error", e);
          reject(e);
        }
      });
    }

    // doItAgain();
    doIt();

  }


  initStream();
  initSocial();

}
initServer();
initBot();