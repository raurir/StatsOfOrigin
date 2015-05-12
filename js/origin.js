var con = console;
var NSW = "NSW", QLD = "QLD";
var data;
var margin = {top: 20, right: 30, bottom: 30, left: 60},
  width = 400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

(function() {

  var webgl, graph2;

  // rename frog to whatever it actually is.
  var frog = {
    series_winner: [],
    matches_won: [],
    points_scored: [],
    tries_scored: [],
  }

  function toggle(data) {
    var nsw = data.map(function(d) { return d[0];})
    var qld = data.map(function(d) { return d[1];})
    var max = d3.max(data, function(d){ return Math.max(d[0], d[1]); })
    svg.update(nsw, qld, max);
    setTimeout(function() {
      webgl.update(nsw, qld, max);
    }, 500);
  }


  function initUI() {


    var mouseDown = false;
    var position = {x: 0, y: 0};
    var start = {x: 0, y: 0}

    function onDown(e) {
      mouseDown = true;
      position = {x: e.x, y: e.y};
      start.x = position.x; start.y = position.y;
    }
    function onUp(e) {
      mouseDown = false;
    }
    function onMove(e) {
      position = {x: e.x, y: e.y};
      if (mouseDown) webgl.interact({x: position.x - start.x, y: position.y - start.y});
    }

    addEventListener("mousedown", onDown);
    addEventListener("touchstart", onDown);
    addEventListener("mouseup", onUp);
    addEventListener("touchend", onUp);
    addEventListener("mousemove", onMove);
    addEventListener("touchdrag", onMove);



    var buttonNames = [
      {
        label: "Series",
        stat: frog.series_winner
      },{
        label: "Matches",
        stat: frog.matches_won
      },{
        label: "Points",
        stat: frog.points_scored
      }
    ];
    var buttons = document.getElementById("buttons");
    for ( var b in buttonNames) {
      b = buttonNames[b];
      var button = document.createElement("div");
      button.stat = b.stat;
      button.innerHTML = b.label;
      button.className = "button";
      buttons.appendChild(button);
      button.addEventListener("click", function() {
        toggle(this.stat);
      })
    }
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

      frog.series_winner.push([incremental_series.NSW, incremental_series.QLD]);




      // start matches

      incremental_matches.NSW += years[yearIndex].NSW;
      incremental_matches.QLD += years[yearIndex].QLD;

      // years[yearIndex].incremental_matches = {
      //   NSW: incremental_matches.NSW,
      //   QLD: incremental_matches.QLD
      // }

      frog.matches_won.push([incremental_matches.NSW, incremental_matches.QLD]);


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

      frog.points_scored.push([incremental_points.NSW, incremental_points.QLD]);

      // frog.tries_scored.push([incremental_matches.NSW, incremental_matches.QLD]);

    }

    // con.log(years);

    var zero = years.map(function(){return [0,0];});
    data = zero;

    webgl = create3d();
    svg = create2d();
    initUI();
    toggle(frog.points_scored);

  }

  parse();

})();