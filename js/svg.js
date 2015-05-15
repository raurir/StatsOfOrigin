function create2d() {

  var chart = d3.select("#svgcontainer")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scale.linear()
  .domain([0, years.length])
  .range([0, width]);

  var y = d3.scale.linear()
  .domain([0, d3.max(data, function(d){ return Math.max(d[0], d[1]); })])
  .range([height,0]);

  var nsw = data.map(function(d) { return d[0];})
  var qld = data.map(function(d) { return d[1];})

  var area = d3.svg.area()
  .x(function(d,i) {
    // con.log("x", d);
    return x(i);
  })
  .y0(height).y1(function(d, i) {
    // con.log("y1", i , y(d));
    return y(d);
  });

  var line = d3.svg.line()
  .x(function(d,i) {
    con.log(d,i)
    return x(i);
  })
  .y(function(d, i) {
    // con.log(d,y(d))
    return y(d);
  });


  chart
  .selectAll("path.area")
  .data([nsw,qld])
  .enter()
  .append("path")
  .attr("class", function(d,i) { return "area " + [NSW,QLD][i]; })
  .attr("d", area);

  chart
  .selectAll("path")
  .data([nsw,qld])
  .enter()
  .append("path")
  .attr("class", "line")
  .attr("d", line);


  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .ticks(years.length / 4)
  .tickFormat(function(d){
    return years[d].year;
  });

  chart.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

  chart.append("g")
  .attr("class", "y axis")
  .call(yAxis);


  var pointsNSW = point(NSW, nsw);
  var pointsQLD = point(QLD, qld);

  function point(state, stateData) {

    var g = chart.selectAll(".point." + state)
    .data(stateData)
    .enter()
    .append("svg:circle")
    .attr("class", state)
    .attr("cx", function(d, i) { return x(i); })
    .attr("cy", function(d, i) { return y(d); })
    .attr("r", 5);

    g.on("mouseover", function(d,i){
      // con.log(this);

      // con.log(years[i])
      var m = years[i].matches.map(function(match,i) {
        // con.log(match)
        return [
          match.winner.team,
          " defeated ",
          match.loser.team,
          " (",
          match.winner.score,
          "-",
          match.loser.score
        ].join("");
      })

      var state = this.attributes.class.value;
      tooltip.text([state, years[i].year, "value", d, m].join(" "))
      tooltip.style("visibility", "visible");
    })
    .on("mousemove", function(d,i){

      var x = margin.left + Number(this.attributes.cx.value) + "px",
        y = 10 + margin.top + Number(this.attributes.cy.value) + "px";

        // con.log(x,y);
      return tooltip.style("left", x).style("top", y);
      // return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    return g;
  }

  var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");;




  function update(nsw, qld, max) {

    y
    .domain([0, max])
    .range([height, 0]);

    d3.select(".y.axis")
    .transition()
    // .duration(1750)
    .call(yAxis);


    chart
    .selectAll("path.area")
    .data([nsw,qld])
    .transition()
    // .duration(750)
    .attr("d", function(d) { return area(d); });


    chart
    .selectAll("path.line")
    .data([nsw,qld])
    .transition()
    // .duration(750)
    .attr("d", line);


    function updatePoints(points, data) {
      points
      .data(data)
      .transition()
      .attr("cy", function(d, i) { return y(d); })
      // .duration(function(d, i) { return i * 40;} )
    }
    updatePoints(pointsNSW, nsw);
    updatePoints(pointsQLD, qld);


  }

  return {
    update: update
  }
}