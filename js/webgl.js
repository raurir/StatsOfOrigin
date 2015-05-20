function create3d() {

  var MODE_COUNTDOWN = "countdown";
  var MODE_STAT = "stat";
  var mode = MODE_COUNTDOWN;
  var interacting = false;

  var tau = Math.PI * 2;
  var gap = 2;
  var ticksX = [];
  var yearJump = 5;
  var unis = [];

  var rotationY = 0, rotationX = 0;
  var maxHeight = 40;

  var cubes = [[],[]];
  var sw = window.innerWidth, sh = window.innerHeight;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(35, sw / sh, 0.1, 1000);
  camera.position.y = maxHeight / 2;
  camera.position.z = 100;

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(sw, sh);
  document.getElementById("webglcontainer").appendChild(renderer.domElement);

  group = new THREE.Object3D();
  scene.add(group);

  var groupAxisY = new THREE.Object3D();
  group.add(groupAxisY);

  var groupAxisX = new THREE.Object3D();
  group.add(groupAxisX);

  var light = new THREE.AmbientLight(0x404040);
  scene.add( light );

  var pointLight =  new THREE.PointLight(0xffffff);//0x662BDE);
  pointLight.position.z = 30;
  scene.add(pointLight);

  var countdown = initCountdown();
  scene.add(countdown.group);
  countdown.group.position.y = camera.position.y;
  countdown.group.position.z = 10;

  resize(sw, sh);

  function generateTick(label, major, xd, yd, zd, x, y, z) {

    var colours = major ? [0xc0c0c0, 0x505050] : [0x808080, 0x505050];

    var dashGeometry = new THREE.BoxGeometry(xd, yd, zd);
    var dashMaterial = new THREE.MeshPhongMaterial({
      ambient: colours[1],
      color: colours[0],
      specular: colours[0],
      shininess: 1,
      shading: THREE.SmoothShading
    } )
    var dash = new THREE.Mesh(dashGeometry, dashMaterial);

    var textMaterial = new THREE.MeshFaceMaterial([
      new THREE.MeshPhongMaterial({color: colours[0], shading: THREE.FlatShading}), // front
      new THREE.MeshPhongMaterial({color: colours[1], shading: THREE.SmoothShading}) // side
    ] );
    var textGeometry = new THREE.TextGeometry(label, {
      size: 2,
      height: 1,
      curveSegments: 4,
      font: 'helvetiker',
      // weight: weight,
      // style: style,
      material: 0,
      extrudeMaterial: 1
    });
    textGeometry.computeBoundingBox();
    textGeometry.computeVertexNormals();

    var text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.x = x;
    text.position.y = y;
    text.position.z = z;

    var tick = new THREE.Object3D();
    tick.add(dash);
    tick.add(text);

    return tick;
  }

  function generateTickX(label, major) {
    return generateTick(label, major, 0.3, 1, 0.3, -3, -3, 0);
  }

  function generateTickY(label, major) {
    return generateTick(label, major, 3, 0.3, 0.3, 2, -1, 0);
  }

   // thanks Airtasker! - wrote this function for airtasker payment history.
  var fixMaxY = function(largest, ticks) {
    var goodTick, num, roundNumbers, tick, _j, _len;
    roundNumbers = [
      1, 2, 5,
      10, 20, 30, 40, 50, 60, 75, 80,
      100, 200, 300, 400, 500, 750, 800,
      1000, 1250, 1500, 1750,
      2000, 3000, 4000, 5000, 6000, 7500,
      1e4, 2e4, 5e4, 1e5, 2e5, 5e5];
    tick = largest / ticks;
    goodTick = null;
    for (_j = 0, _len = roundNumbers.length; _j < _len; _j++) {
      num = roundNumbers[_j];
      if (tick < num) {
        goodTick = num;
      }
      if (goodTick !== null) {
        break;
      }
    }
    return goodTick * ticks;
  };


  function update(nsw, qld, max) {

    unis = [];

    // TweenMax.to(groupAxisY, 0.5, {alpha: 0});

    function renderYear(teamIndex, height, yearIndex, red, green, blue) {

      var cube;

      var h = height / max * maxHeight;
      if (h == 0) h = 0.01;

      var x = (-years.length / 2 + yearIndex) * gap,
        y = h / 2,
        z = (teamIndex ? 1 : -1) * 2;

      if (cubes[teamIndex][yearIndex]) { // already exists, let's re use it!

        cube = cubes[teamIndex][yearIndex];

      } else {

        var uniforms = {
          time: { type: "f", value: 1.0 },
          index: { type: "f", value: i / il},
          resolution: { type: "v2", value: new THREE.Vector2() },
          red: { type: "f", value: red },
          green: { type: "f", value: green},
          blue: { type: "f", value: blue },
        };

        unis.push(uniforms);

        var material = new THREE.ShaderMaterial( {
          uniforms: uniforms,
          vertexShader: document.getElementById( 'vertexShader' ).textContent,
          fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        });

        var geometry = new THREE.BoxGeometry(1,1,3);
        cube = new THREE.Mesh(geometry, material);
        cubes[teamIndex][yearIndex] = cube;
        group.add(cube);

      }

      cube.position.x = x;
      cube.position.z = z;

      // cube.position.y = 0;
      // cube.scale.y = h ? h : 0.01;

      var delay = 0 + i * 0.02, ease = Bounce.easeOut;

      TweenMax.to(cube.scale, 1.5, {y: h, ease: ease, delay: delay});
      TweenMax.to(cube.position, 1.5, {x: x, y: y, z: z, ease: ease, delay: delay});

    }



    for (var i = 0, il = nsw.length; i < il; i++) {
      renderYear(0, nsw[i], i, 0.0, 0.6, 1);
    }

    for (i = 0, il = qld.length; i < il; i++) {
      renderYear(1, qld[i], i, 1, 0, 0.4);
    }

    for (var i = groupAxisY.children.length - 1; i > -1; i--) {
      groupAxisY.remove(groupAxisY.children[i]);
    }

    var maxY = fixMaxY(max, 5);

    var tickMesh = generateTickY(max, true);
    groupAxisY.add(tickMesh);
    tickMesh.position.y = maxHeight;

    var ticksVertical = 6;
    for (i = 0, il = ticksVertical; i < il; i++) {
      var perc = i / (il - 1);
      var text = perc * maxY;
      var y = perc * maxHeight * maxY / max;
      if (Math.abs(y - maxHeight) > 4) { // don't draw tick near major tick
        var tickMesh = generateTickY(text, false);
        groupAxisY.add(tickMesh);
        tickMesh.position.y = y;
      }
    }

    for (i = 0, il = years.length / yearJump; i < il; i++) {
      if (ticksX[i] == undefined) {
        var yearIndex = i * yearJump;
        var text = years[yearIndex].year;
        var tickMesh = generateTickX(text, false);
        groupAxisX.add(tickMesh);
        tickMesh.position.x = (-years.length / 2 + yearIndex) * gap;
        ticksX[i] = tickMesh;
      }
    }

    groupAxisX.position.y = -0.5;
    groupAxisY.position.x = years.length / 2 * gap;


    // con.log("ticksVertical", ticksVertical)

  }

  function clampRotation(r) {
    return r < 0 ? r + tau : r > tau ? r - tau : r;
  }

  function interactStart() {
    interacting = true;
  }

  function interactMove(delta) {
    if (mode === MODE_COUNTDOWN) return;
    rotationY += delta.x * 0.01;
    rotationX += delta.y * 0.01;
    rotationY = clampRotation(rotationY);
  }

  function interactStop() {
    interacting = false;
  }

  function showGroup(group, doShow) {
    group.traverse(function(object) {
      object.visible = doShow;
    });
  };

  function showAxis(doShow) {
    showGroup(groupAxisX, doShow);
    showGroup(groupAxisY, doShow);
  }
  var rotationYTarget = 0;
  var rotationQLDMin = tau * 1 / 4;
  var rotationQLDMax = tau * 3 / 4;
  function showCountdown(doShow) {
    mode = doShow ? MODE_COUNTDOWN : MODE_STAT;
    rotationYTarget = isMaroon(rotationY) ? Math.PI : 0;
    if (rotationY > rotationQLDMax) rotationYTarget = tau;
    showAxis(!doShow);
    showGroup(countdown.group, doShow);
  }

  function resize(width, height) {
    var aspect = 9 / 6;
    var w = width, h = w / aspect;
    var margin = 0;
    if (h > height) {
      h = height
      w = h * aspect;
    }
    margin = (height - h) / 2;
    // con.log("resize",w,h);
    renderer.domElement.style.marginTop = margin + "px";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function isMaroon(rotation) {
    var qldSide = rotation > rotationQLDMin && rotation < rotationQLDMax; 
    return qldSide; // so here's a biased function. up the maroons. 
  }

  function render(time) {

    var t = time * 0.001;
    pointLight.position.x = Math.sin(t) * 15;
    pointLight.position.y = Math.cos(t) * 15;

    countdown.update(time);

    var qldSide = isMaroon(rotationY);

    if (mode === MODE_COUNTDOWN) { // flatten graph to either side in countdown mode.
      rotationY -= (rotationY - rotationYTarget) * 0.1;
    }

    if (!interacting) { // flatten graph when interaction stops.
      rotationX -= (rotationX - 0) * 0.1;
    }

    for (var i = 0, il = unis.length; i < il; i++) {
      unis[i].time.value = time * 0.0012;
    }

    // debug.innerHTML = rotationY;
    // if (qldSide) {
    //   debug.style.background = "blue";
    // } else {
    //   debug.style.background = "red";
    // }

    group.rotation.x = rotationX;
    group.rotation.y = rotationY;

    groupAxisY.rotation.y = -group.rotation.y;

    groupAxisX.position.z -= (groupAxisX.position.z - (qldSide ? -1 : 1) * 3) * 0.2;
    groupAxisY.position.z = groupAxisX.position.z;

    for (var i = 0, il = years.length / yearJump; i < il; i++) {
      if (ticksX[i]) {
        // ticksX[i].rotation.x = -rotationX;
        ticksX[i].rotation.y = -rotationY;
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  render(0);

  return {
    interactStart: interactStart,
    interactStop: interactStop,
    interactMove: interactMove,
    update: update,
    showCountdown: showCountdown,
    resize: resize,

  }

}