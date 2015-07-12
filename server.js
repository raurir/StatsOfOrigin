var OriginBot = require("./originbot");
var OriginServer = require("./originserver");

var history = []; // this is the tweet history.

var bot = OriginBot({
	history: history, 		// twitter bot adds to it.
	database: {
		name: 'mongodb://127.0.0.1:27017/test',
		collection: "test_insert"
	},
	term: "stateoforigin,#nrl,state of origin,maroons blues",
	bad: {
		text: /(RT|loan|→|Poll)/,
	 	users: ["johnspatricc", "aunewse", "l5iza", "gima2327"],
	},
	twitter: {
    consumer_key: process.env.ORIGIN_TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.ORIGIN_TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.ORIGIN_TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ORIGIN_TWITTER_ACCESS_TOKEN_SECRET,
  },
  start: {
  	stream: true,
  	social: false
  }
}); 
// OriginServer(history); // server outputs it.
