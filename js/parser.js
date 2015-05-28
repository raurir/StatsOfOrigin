function parse() {

  var criteria = {
    series_winner: [],
    matches_won: [],
    points_scored: [],
    tries_scored: [],
  }

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

    if (years[yearIndex].inprogress) {

      // ignore this sicne it's inprogress

      criteria.series_winner.push([years[yearIndex].NSW, years[yearIndex].QLD]);

    } else {
      years[yearIndex].winner = years[yearIndex].NSW > years[yearIndex].QLD ? NSW : QLD;

      incremental_series.NSW += years[yearIndex].winner == NSW ? 1 : 0;
      incremental_series.QLD += years[yearIndex].winner == QLD ? 1 : 0;

      // years[yearIndex].incremental_series = {
      //   NSW: incremental_series.NSW,
      //   QLD: incremental_series.QLD
      // }

      criteria.series_winner.push([incremental_series.NSW, incremental_series.QLD]);

    }


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

  return criteria;
}