function initCountdown() {

  /*

  Origin Game One: NSW vs Queensland – Wednesday, 27 May 2015, 8.00pm AEST – ANZ Stadium, Sydney
  Origin Game Two: NSW vs Queensland – Wednesday, 17 June 2015, 8.00pm AEST – Melbourne Cricket Ground
  Origin Game Three: Queensland vs NSW – Wednesday 8 July 2015, 8.00pm AEST – Suncorp Stadium, Brisbane

  */

  var div = document.createElement("div");

  var end = new Date(2015, 05, 17, 20, 0 );

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
      clearInterval(timer);
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


  // var sw = 800, sh = 300;

  // var scene = new THREE.Scene();
  // var camera = new THREE.PerspectiveCamera(25, sw / sh, 0.1, 1000);

  // var renderer = new THREE.WebGLRenderer();
  // renderer.setSize(sw, sh);
  // document.getElementById("container-countdown").appendChild(renderer.domElement);

  // var light = new THREE.AmbientLight(0x202020); // soft white light
  // scene.add( light );

  // var pointLight =  new THREE.PointLight(0xa00030);
  // pointLight.position.y = 50;
  // scene.add(pointLight);

  // var pointLight2 =  new THREE.PointLight(0x000090);
  // pointLight2.position.y = 50;
  // scene.add(pointLight2);

  // var pointLight3=  new THREE.PointLight(0xf0f0f0);
  // pointLight3.position.y = 50;
  // pointLight3.position.z = 50;
  // scene.add(pointLight3);

  // camera.position.z = 60;
  // camera.position.y = 14;
  // camera.lookAt(new THREE.Vector3(0, 0, 0));


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

  // group.add(meshes[0][4]);

/*
  function render(time) {
    // con.log(t)
    if (time > 200) showRemaining();
    // group.rotation.y = 0;

    var t = time * 0.002;

    pointLight.position.x = Math.sin(t) * 15;
    pointLight.position.z = Math.cos(t) * 15;
    pointLight2.position.x = -Math.sin(t *.9) * 15;
    pointLight2.position.z = -Math.cos(t *.9) * 15;
    pointLight3.position.x = -Math.sin(t *.8) * 15;
    pointLight3.position.z = -Math.cos(t *.8) * 15;

    // con.log(pointLight.position.x,pointLight.position.z)
    // pointLight.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.render(scene, camera);

    // con.log(time);
    //if (time < 3000)
    requestAnimationFrame(render);
  };
*/

  function update(time) {
    if (time > 200) showRemaining();
  }

  // render(0);

  return {
    group: group,
    div: div,
    update: update
  }


}

