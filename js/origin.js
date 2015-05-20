var con = console;
var NSW = "NSW", QLD = "QLD";
var data;


var EVENT_COUNTDOWN_SELECTED = "EVENT_COUNTDOWN_SELECTED";
var EVENT_STAT_SELECTED = "EVENT_STAT_SELECTED";
var EVENT_SHOW = "EVENT_SHOW";
var EVENT_INTERACT_START = "EVENT_INTERACT_START";
var EVENT_INTERACT_STOP = "EVENT_INTERACT_STOP";
var EVENT_INTERACT_MOVE = "EVENT_INTERACT_MOVE";

(function() {

  var webgl, graph2;

  // rename criteria to whatever it actually is.
  var criteria = parse();
  var titles = {
    series_winner: "Total series won",
    matches_won: "Total matches won",
    points_scored: "Total points scored"
    // tries_scored: [],
  }

  function initOrigin() {

    // con.log(years);

    var zero = years.map(function(){return [0,0];});
    data = zero;

    webgl = create3d();
    svg = create2d();
    ui = initUI();

    function showCountdown() {
      webgl.showCount(true);
      document.getElementById("buttons-help").innerHTML = "Select an option below to see historical results";
      document.getElementById("stat").innerHTML = "Countdown to next match";
      dispatchEvent(new CustomEvent(EVENT_SHOW, {detail: "countdown"}));
    }

    function showCriteria(id) {
      var data = criteria[id];
      var nsw = data.map(function(d) { return d[0];})
      var qld = data.map(function(d) { return d[1];})
      var max = d3.max(data, function(d){ return Math.max(d[0], d[1]); })
      svg.update(nsw, qld, max);
      webgl.update(nsw, qld, max);

      webgl.showCount(false);

      document.getElementById("buttons-help").innerHTML = "Drag the graph to explore or Select an option below";

      var finalStat = data[data.length - 1];
      var title = [titles[id], "-", "NSW:", finalStat[0], "QLD:", finalStat[1]].join(" ");
      document.getElementById("stat").innerHTML = title;

      dispatchEvent(new CustomEvent(EVENT_SHOW, {detail: id}));
    }

    addEventListener(EVENT_STAT_SELECTED, function(e) {
      showCriteria(e.detail);
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
    addEventListener('resize', function(e) {
      webgl.resize(window.innerWidth, window.innerHeight);
    });

    webgl.update(zero, zero, 0);

    showCountdown();

  }

  initOrigin();

})();