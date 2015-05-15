var con = console;
var NSW = "NSW", QLD = "QLD";
var data;
var margin = {top: 20, right: 30, bottom: 30, left: 60},
  width = 400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

(function() {

  var webgl, graph2;

  // rename criteria to whatever it actually is.
  var criteria = {
    series_winner: [],
    matches_won: [],
    points_scored: [],
    tries_scored: [],
  }


  var buttonNames = [
    {
      label: "Series",
      title: "Total series won",
      data: criteria.series_winner
    },{
      label: "Matches",
      title: "Total matches won",
      data: criteria.matches_won
    },{
      label: "Points",
      title: "Total points scored",
      data: criteria.points_scored
    }
  ];






  function toggle(b) {
    var data = b.data;
    var nsw = data.map(function(d) { return d[0];})
    var qld = data.map(function(d) { return d[1];})
    var max = d3.max(data, function(d){ return Math.max(d[0], d[1]); })
    svg.update(nsw, qld, max);
    // setTimeout(function() {
    webgl.update(nsw, qld, max);
    // }, 500);
    document.getElementById("stat").innerHTML = b.title;
  }


  function initUI() {
    con.log("initUI!")

    var mouseDown = false;
    var position = {x: 0, y: 0};
    var start = {x: 0, y: 0}

    function onDown(e) {
      mouseDown = true;
      if (e.changedTouches) e = e.changedTouches[0];
      // con.log("e.changedTouches", e)
      position = {x: e.clientX, y: e.clientY};
      start.x = position.x; start.y = position.y;
      webgl.interactStart();
    }
    function onUp(e) {
      mouseDown = false;
      webgl.interactStop();
    }
    function onMove(e) {
      if (e.changedTouches) e = e.changedTouches[0];
      // con.log("e.changedTouches", e)
      position = {x: e.clientX, y: e.clientY};
      if (mouseDown) webgl.interactMove({x: position.x - start.x, y: position.y - start.y});
      start.x = position.x; start.y = position.y;
    }

    addEventListener("mousedown", onDown);
    addEventListener("mouseup", onUp);
    addEventListener("mousemove", onMove);
    addEventListener("touchstart", onDown);
    addEventListener("touchend", onUp);
    addEventListener("touchmove", onMove);

    var buttons = document.getElementById("buttons");

    function createButton(b) {
      var button = document.createElement("div");
      button.innerHTML = b.label;
      button.className = "button";
      buttons.appendChild(button);
      button.addEventListener("click", function() {
        toggle(b);
      })
    }


    for ( var b in buttonNames) {
      createButton(buttonNames[b]);
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
    initUI();
    toggle(buttonNames[0]);

  }

  parse();

})();