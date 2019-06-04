var con = console;
var NSW = "NSW",
  QLD = "QLD";
var EVENT_COUNTDOWN_SELECTED = "EVENT_COUNTDOWN_SELECTED";
var EVENT_STATE_SELECTED = "EVENT_STATE_SELECTED";
var EVENT_STAT_SELECTED = "EVENT_STAT_SELECTED";
var EVENT_SHOW = "EVENT_SHOW";
var EVENT_INTERACT_START = "EVENT_INTERACT_START";
var EVENT_INTERACT_STOP = "EVENT_INTERACT_STOP";
var EVENT_INTERACT_MOVE = "EVENT_INTERACT_MOVE";

var data, font;

(function() {
  var criteria = parse();
  // con.log(years);
  var titles = {
    series_winner: "Total series won",
    matches_won: "Total matches won",
    points_scored: "Total points scored"
    // tries_scored: [],
  };

  var zero = years.map(function() {
    return [0, 0];
  }); // create an array of [0,0] as long as we have years.
  data = zero;

  var countdown = initCountdown();
  var webgl = create3d({ countdown: countdown });
  var svg = create2d({ display: !webgl.ok });
  var ui = initUI();
  var clicks = 0;
  function clicked() {
    if (clicks++ > 2)
      document.getElementById("buttons-help").style.display = "none";
  }

  // con.log(webgl, webgl.ok);

  function update(time) {
    countdown.update(time);
    requestAnimationFrame(update);
  }

  function showCountdown() {
    clicked();
    document.getElementById("stat").innerHTML = "Countdown to next match";
    if (webgl.ok) {
      webgl.showCountdown(true);
    } else {
      document.getElementById("stat").appendChild(countdown.div);
    }
    document.getElementById("buttons-help").innerHTML =
      "Select an option below to see historical results";
    dispatchEvent(new CustomEvent(EVENT_SHOW, { detail: "countdown" }));
  }

  function showCriteria(id) {
    clicked();
    var data = criteria[id];
    var nsw = data.map(function(d) {
      return d[0];
    });
    var qld = data.map(function(d) {
      return d[1];
    });
    var max = d3.max(data, function(d) {
      return Math.max(d[0], d[1]);
    });

    svg.update(nsw, qld, max);
    webgl.showCountdown(false);
    webgl.update(nsw, qld, max);

    document.getElementById("buttons-help").innerHTML =
      "Drag the graph to explore or Select an option below";
    var finalStat = data[data.length - 1];
    var title = [
      titles[id],
      "-",
      "NSW:",
      finalStat[0],
      "QLD:",
      finalStat[1]
    ].join(" ");
    document.getElementById("stat").innerHTML = title;

    dispatchEvent(new CustomEvent(EVENT_SHOW, { detail: id }));
  }

  function showState(state) {
    con.log("showState", state);
    svg.showState(state);
    webgl.showState(state);
  }

  addEventListener(EVENT_STAT_SELECTED, function(e) {
    showCriteria(e.detail);
  });
  addEventListener(EVENT_STATE_SELECTED, function(e) {
    showState(e.detail);
  });
  addEventListener(EVENT_COUNTDOWN_SELECTED, function(e) {
    showCountdown();
  });
  addEventListener(EVENT_INTERACT_STOP, function(e) {
    webgl.interactStop();
  });
  addEventListener(EVENT_INTERACT_START, function(e) {
    webgl.interactStart();
  });
  addEventListener(EVENT_INTERACT_MOVE, function(e) {
    webgl.interactMove(e.detail);
  });
  addEventListener(EVENT_INTERACT_MOVE, function(e) {
    webgl.interactMove(e.detail);
  });
  addEventListener("resize", function(e) {
    svg.resize(window.innerWidth, window.innerHeight);
    webgl.resize(window.innerWidth, window.innerHeight);
  });

  if (webgl.ok) {
    var loader = new THREE.FontLoader();
    loader.load("fonts/helvetiker_regular.typeface.json", function(fuck) {
      font = fuck; // making fuck available globally as font. WHY? Because FUCK deprecating changes on a Sunday evening.
      countdown.init();
      webgl.init();
      webgl.update(zero, zero, 0);
      showCountdown();
    });
  } else {
    update(0);
    showCountdown();
  }
})();
