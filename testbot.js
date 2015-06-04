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

var botID = 0; // your id

var client = socialbot.initClient({
  consumer_key: process.env.ORIGIN_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.ORIGIN_TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.ORIGIN_TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ORIGIN_TWITTER_ACCESS_TOKEN_SECRET,
});
con.log(client)

client.get('statuses/mentions_timeline', function(error, tweets, response){
  if(error) throw error;
  console.log("len", tweets.length);
  for (var i = tweets.length - 1; i >= 0; i--) {
    console.log(i, tweets[i].text);
  };
  // console.log(response);  // Raw response object.
});


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