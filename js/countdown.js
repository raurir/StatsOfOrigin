function initCountdown() {

  /*

  The 2016 State of Origin dates are:
  Game 1: ANZ Stadium, Sydney on Wednesday 1st June 2016.
  Game 2: Suncorp Stadium, Brisbane on Wednesday 22nd June 2016.
  Game 3: ANZ Stadium, Sydney on Wednesday 13th July 2016.

  */

  var div = document.createElement("div");

  var end = new Date(2016, 5, 1, 20, 0);

  var _second = 1000;
  var _minute = _second * 60;
  var _hour = _minute * 60;
  var _day = _hour * 24;

  var lastSecond = null, lastArray = [];

  var offScreenY = 40

  function getSymbol(symbol) {
    // for (var i = 0, il = meshes[symbol].length; i < il;i++) {
    for (var i in meshes[symbol]) {
      // con.log("i", meshes[symbol][i])
      if (meshes[symbol][i].used == false) {
        meshes[symbol][i].used = true;
        return meshes[symbol][i];
      }
    }
  }

  var xPositions = [1,1,4,1,1,3,1,1,3.5,1,1];
  var existing = [];
  var uninitialised = xPositions.map(function(v,i){return i;});
  var initialised = xPositions.map(function(v,i){return false;});

  function showRemaining() {
    var now = new Date();
    var distance = end - now;
    if (distance < 0) {
      // clearInterval(timer);
      return;
    }

    function pad(n) { return String((String(n).length === 1) ? "0" + n : n); }

    var days = pad(Math.floor(distance / _day));
    var hours = pad(Math.floor((distance % _day) / _hour));
    var minutes = pad(Math.floor((distance % _hour) / _minute));
    var seconds = pad(Math.floor((distance % _minute) / _second));




    if (lastSecond !== seconds ) {

      var arr = [].concat(
        days.split("")
      ).concat("days").concat(
        hours.split("")
      ).concat("hrs").concat(
        minutes.split("")
      ).concat("mins").concat(
        seconds.split("")
      )

      // arr = seconds.split("")
      // xPositions = [1,1];
      // con.log("arr", arr.join(" "));
      if (xPositions.length !== arr.length) throw new Error("wrong length:" + xPositions.length + " v " + arr.length);

      div.innerHTML = arr.join(" ");

      // initialise this symbol
      var doInit = uninitialised.length;// && Math.random() > 0.7;
      if (doInit) {
        var index = Math.floor(Math.random() * uninitialised.length);
        var toInitialise = uninitialised[index];
        uninitialised.splice(index, 1);
        initialised[toInitialise] = true;
        // con.log(index, toInitialise);
        // con.log(uninitialised, initialised);
      }


      function remove(symbol) {
        // con.log("remove", symbol, new Date().getTime());
        TweenMax.to(symbol.mesh.position, 0.3, {y: -offScreenY, delay: 0.1, ease: Quad.easeIn, onComplete: function() {
          // con.log("this", mesh);
          symbol.used = false;
        }});
      }

      function drop(symbol, x) {
        // con.log("drop", symbol, new Date().getTime());
        var mesh = symbol.mesh;
        TweenMax.fromTo(mesh.position, 0.3, {x: x, y: offScreenY}, {y: 0, ease: Bounce.easeOut })
      }

      var xp = -9;
      for (var i = 0, il = arr.length; i < il; i++) {
        var symbol = arr[i];

        if (initialised[i]) {
          // con.log(i);
          if (lastArray[i] !== arr[i]) {

            if (existing[i]) {
              remove(existing[i]);
            }

            var symbol = getSymbol(symbol);
            drop(symbol, xp * 3);
            existing[i] = symbol;

          }

          lastArray[i] = arr[i];

        }

        xp += xPositions[i];

      }


    }
    lastSecond = seconds;

  }

  var group = new THREE.Object3D();

  function generateCharacter(glyph) {
    var material = new THREE.MeshFaceMaterial([
      new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.FlatShading}), // front
      new THREE.MeshPhongMaterial({color: 0x505050, shading: THREE.MeshLambertMaterial}) // side
    ] );
    if (glyph === 10) glyph = ":";
    var geometry = new THREE.TextGeometry(glyph, {
      size: 3,
      height: 4,
      curveSegments: 3,
      font: 'helvetiker',
      // weight: "bold",
      // style: style,
      material: 0,
      extrudeMaterial: 1
    });
    geometry.computeBoundingBox();
    geometry.computeVertexNormals();

    var text = new THREE.Mesh(geometry, material);

    return text;
  }


  var symbols = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ":",
    "days",
    "hrs",
    "mins",
    "secs",
  ]
  var meshes = {};

  for (var n = 0; n < symbols.length; n++) {
    var str = symbols[n];
    meshes[str] = [];
    for (var i = 0; i < 8; i++) {
      var mesh = generateCharacter(str);
      meshes[str][i] = {
        chr: str,
        mesh: mesh,
        used: false
      };
      mesh.position.set(0, offScreenY, 0);
      group.add(mesh);
    }


  };

  function update(time) {
    if (time > 200) showRemaining();
  }

  return {
    group: group,
    div: div,
    update: update
  }

}