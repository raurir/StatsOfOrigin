var express = require('express');
var fs = require("fs");
var http = require("http");
var https = require("https");
var Promise = require('promise');
var request = require("request");

var con = console;

module.exports = function(history) {
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