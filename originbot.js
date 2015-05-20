var Twitter = require("twitter");
var _ = require("underscore");
var fs = require("fs");
var http = require("http");
var https = require("https");
var Promise = require('promise');
var request = require("request");

var con = console;

function initBot() {
	con.log("initialising bot");

	var botID = "3171474097",
		hits = 0,
		client,
		sourceTweet = null;

	function initClient() {
		if (client) return;
		con.log("initialising client");
		client = new Twitter({
			consumer_key: process.env.TWITTER_CONSUMER_KEY,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
			access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
			access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
		});
		// con.log("client", client)
	}

	function initStream() {
		initClient();
		con.log("initialising twitter stream");

		client.stream("statuses/filter", {track: "DescribeYourselfIn3Words"}, function(stream) {
			stream.on("data", function(tweet) {

				con.log(tweet.text);

				if (tweet.user) {
					if (tweet.user.id_str === botID) {
						// con.log("Got an echo of myself!", tweet.text)
					} else {

						if (tweet.text) {
							// con.log("stream(user) - ok - tweet.text", tweet.text);

							// con.log("=====================================");
							// con.log("stream(user) - ok", tweet);
							// con.log("=====================================");

							if (tweet.entities.user_mentions) {
								var botMentioned = _.findWhere(tweet.entities.user_mentions, {id_str: botID});
								if (botMentioned) {
									con.log("stream(user) - ok - botMentioned", botMentioned);
									parseTweet(tweet);
								} else {
									// con.log("stream(user) - ok not mentioned", botMentioned);
								}
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





	function postMedia(image) {
		return new Promise(function(fulfill, reject) {

			con.log("postMedia", image);
			hits ++;
			if (hits > 2) {
				con.log("too many hits!");
				reject(new Error("more than 5 hits!"));
			}

			con.log("trying client.post!");
			try {

				// Make post request on media endpoint. Pass file data as media parameter
				client.post("media/upload", {media: image}, function(error, media, response){
					if (error) {
						con.log("postMedia reject 01", error);
						reject(error);
					} else {
						con.log("postMedia fulfill!");
						fulfill(media);
					}
				});

			} catch (e) {
				con.log("postMedia reject 03", e);
				reject(e);
			}

		});
	}

	function postMediaTweet(media) {
		return new Promise(function(fulfill, reject) {
			// If successful, a media object will be returned.
			con.log("postMediaTweet media success", media);

			// Lets tweet it
			var status = {
				status: "@" + sourceTweet.user.screen_name + " your ansi", // Here is an image I made earlier...",
				media_ids: media.media_id_string,
				in_reply_to_status_id: sourceTweet.id_str
			}

			try {

				client.post("statuses/update", status, function(error, tweet, response){
					if (error) {
						con.log("postMediaTweet reject 02", error);
						reject(error);
					} else {
						con.log("postMediaTweet fulfill");
						fulfill(tweet);
					}
				});

			} catch (e) {
				con.log("postMediaTweet reject 01", e);
				reject(e);
			}

		})
	}

	function checkURL(url){
		return new Promise(function (fulfill, reject){
			request({
				method: "HEAD",
				url: url,
				followAllRedirects: true
			},
			function (error, response, body) {
				if (error) {
					con.log("checkURL reject", response);
					reject(response);
				} else {
					fulfill(response.request.uri.href);
				}
			});
		});
	}

	function parseTweet(tweet) {
		var text = tweet.text;
		var url = null;
		_.each(text.split(" "), function(param,i) {
			switch(param) {
				default :
					con.log("parseTweet - Nothing implemented:", param);
			}
		})

		if (url) {

			sourceTweet = tweet;

			var tweeter = checkURL(url)
				.then(loadImageURL)

				// .then(saveFile)

				.then(makeImage)
				.then(ansiconvert.render)
				.then(ansiconvert.getBuffer)

				//.then(saveFile).then(makeImage)

				.then(postMedia).then(postMediaTweet);

		} else {
			con.log("parseTweet no URL found?", text);
		}
	}

	// parseTweet({text: "@ansibot https://40.media.tumblr.com/0c83e15287453bbc777fb29bcad30822/tumblr_nn9bn13FAt1ro1dyeo1_540.png 1x"});
	// parseTweet({text: "@ansibot http://i.imgur.com/GB89gsO.jpg 1x"});
	// parseTweet({text: "@ansibot http://i.imgur.com/A3JWAcJ.jpg 1x"});
	// parseTweet({text: "@ansibot http://i.imgur.com/NVjJHSNh.jpg 1x"});
	// parseTweet({text: "@ansibot http://p1.pichost.me/640/48/1712789.jpg 1x"});
	// parseTweet({text: "@ansibot http://dreamatico.com/data_images/graffiti/graffiti-1.jpg 1x"});
	// parseTweet({text: "@ansibot http://upload.wikimedia.org/wikipedia/commons/4/46/WP_SOPA_asset_Radial_Gradient.jpg 1x"});
	// parseTweet({text: "@ansibot http://th06.deviantart.net/fs71/PRE/f/2012/278/2/a/rainbow_gradient_by_guildmasterinfinite-d5gv3im.png 1x"});
	// parseTweet({text: "@ansibot http://www.milesjcarter.co.uk/blog/wp-content/uploads/2010/11/gradient21.jpg 1x"});
	// parseTweet({text: "@ansibot gradients.png 1x"});
	// parseTweet({text: "@ansibot savoury.jpg 1x"});
	// parseTweet({text: "@ansibot http://t.co/GiYc8PUmLF 1x"});

	initStream();
	// initClient();

}

initBot();