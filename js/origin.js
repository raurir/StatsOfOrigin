var con = console;
var NSW = "NSW", QLD = "QLD";
var data;
var margin = {top: 20, right: 30, bottom: 30, left: 60},
  width = 400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var EVENT_COUNTDOWN_SELECTED = "EVENT_COUNTDOWN_SELECTED";
var EVENT_STAT_SELECTED = "EVENT_STAT_SELECTED";
var EVENT_SHOW_CRITERIA = "EVENT_SHOW_CRITERIA";
var EVENT_INTERACT_START = "EVENT_INTERACT_START";
var EVENT_INTERACT_STOP = "EVENT_INTERACT_STOP";
var EVENT_INTERACT_MOVE = "EVENT_INTERACT_MOVE";

(function() {

  var webgl, graph2;

  // rename criteria to whatever it actually is.
  var criteria = {
    series_winner: [],
    matches_won: [],
    points_scored: [],
    tries_scored: [],
  }
  var titles = {
    series_winner: "Total series won",
    matches_won: "Total matches won",
    points_scored: "Total points scored"
    // tries_scored: [],
  }



  function parse() {

    var incremental_matches = {
      NSW:0,
      QLD:0
    }
    var incremental_series = {
      NSW:0,
      QLD:0
    }
    var incremental_points = {
      NSW:0,
      QLD:0
    }

    for (var yearIndex = 0; yearIndex < years.length; yearIndex++) {

      // start series

      years[yearIndex].winner = years[yearIndex].NSW > years[yearIndex].QLD ? NSW : QLD;

      incremental_series.NSW += years[yearIndex].winner == NSW ? 1 : 0;
      incremental_series.QLD += years[yearIndex].winner == QLD ? 1 : 0;

      // years[yearIndex].incremental_series = {
      //   NSW: incremental_series.NSW,
      //   QLD: incremental_series.QLD
      // }

      criteria.series_winner.push([incremental_series.NSW, incremental_series.QLD]);




      // start matches

      incremental_matches.NSW += years[yearIndex].NSW;
      incremental_matches.QLD += years[yearIndex].QLD;

      // years[yearIndex].incremental_matches = {
      //   NSW: incremental_matches.NSW,
      //   QLD: incremental_matches.QLD
      // }

      criteria.matches_won.push([incremental_matches.NSW, incremental_matches.QLD]);


      // start match stats
      for (var matchIndex = 0, matches = years[yearIndex].matches.length; matchIndex < matches; matchIndex++) {

        var match = years[yearIndex].matches[matchIndex];

        var nswPoints = (match.winner.team == NSW) ? match.winner.score : match.loser.score;
        var qldPoints = (match.winner.team == QLD) ? match.winner.score : match.loser.score;

        incremental_points.NSW += nswPoints;
        incremental_points.QLD += qldPoints;

        /*
        var details = match.details;
        details = details.split("\n");

        // con.log(match)

        function extr(i) {
          var r =  details[i];
          // r = r.replace(/Queensland/g, "").replace(/New South Wales/g, "")
          r = r.split("(")
          return r[1];
        }

        if (match.winner.team == NSW) {
          // details

          var nsw = extr(0);


          con.log(yearIndex, matchIndex, nsw)
        }
        */

        // con.log(yearIndex, matchIndex, details)

      }

      // years[yearIndex].incremental_points = {
      //   NSW: incremental_points.NSW,
      //   QLD: incremental_points.QLD
      // }

      criteria.points_scored.push([incremental_points.NSW, incremental_points.QLD]);

      // criteria.tries_scored.push([incremental_matches.NSW, incremental_matches.QLD]);

    }

    // con.log(years);

    var zero = years.map(function(){return [0,0];});
    data = zero;

    webgl = create3d();
    svg = create2d();
    ui = initUI();

    function showCriteria(id) {
      var data = criteria[id];
      var nsw = data.map(function(d) { return d[0];})
      var qld = data.map(function(d) { return d[1];})
      var max = d3.max(data, function(d){ return Math.max(d[0], d[1]); })
      svg.update(nsw, qld, max);
      webgl.update(nsw, qld, max);
      dispatchEvent(new CustomEvent(EVENT_SHOW_CRITERIA, {detail: id}));

      var finalStat = data[data.length - 1];
      var title = [titles[id], "-", "NSW:", finalStat[0], "QLD:", finalStat[1]].join(" ");
      document.getElementById("stat").innerHTML = title;
    }

    addEventListener(EVENT_STAT_SELECTED, function(e) {
      showCriteria(e.detail);
    })
    addEventListener(EVENT_INTERACT_STOP, function(e) {
      webgl.interactStop();
    });
    addEventListener(EVENT_INTERACT_START, function(e) {
      webgl.interactStart();
    });
    addEventListener(EVENT_INTERACT_MOVE, function(e) {
      webgl.interactMove(e.detail);
    });

    showCriteria("series_winner");

  }

  parse();

})();