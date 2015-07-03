var OriginBot = require("./originbot");
var OriginServer = require("./originserver");

var history = []; // this is the tweet history.

OriginBot(history); // twitter bot adds to it.
// OriginServer(history); // server outputs it.