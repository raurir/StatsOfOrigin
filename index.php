<html>
  <head>
    <title>StatsOfOrigin - State of Origin Statistics</title>
    <link rel="stylesheet" type="text/css" href='origin.css'/>
    <meta name="viewport" content="initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,width=device-width,height=device-height,user-scalable=yes">
    <link href='http://fonts.googleapis.com/css?family=Roboto:900,400' rel='stylesheet' type='text/css'>
<?PHP
$host = $_SERVER['HTTP_HOST'];
$local = (preg_match("/local/", $host)); # include dev or production files
if ($local) { ?>
    <script src="lib/three.min.js"></script>
    <script src="lib/d3.min.js"></script>
    <script src="lib/TweenMax.min.js"></script>
    <script src="js/data.js"></script>
    <script src="js/parser.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/svg.js"></script>
    <script src="js/countdown.js"></script>
    <script src="js/webgl.js"></script>
<?PHP } else { ?>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r77/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/gsap/latest/TweenMax.min.js"></script>
<?PHP } ?>

<!--
Made by Rauri Rochford
Unbiased Queenslander
Contact: @raurir
Open source at: https://github.com/raurir/StatsOfOrigin
-->

  </head>
  <body>
    <div id='container'>
<!--       <div id='orientation'>Rotate device</div> -->
      <div id='header'>
        <div id='debug'></div>
        <h1>StatsOfOrigin - State of Origin Statistics 1982 - 2016</h1>
        <h4 id='stat'></h4>
      </div>
      <div class='button-show-state button' id='show-NSW'>NSW</div>
      <div class='button-show-state button' id='show-QLD'>QLD</div>
      <div id='webglcontainer'></div>
      <svg id="svgcontainer"></svg>
      <div id="buttons">
        <h4 id='buttons-help'>Drag the graph to explore or Select an option below</h4>
      </div>
    </div>

    <script type="text/javascript">
    var debug = document.getElementById("debug");
    </script>

    <!-- mostly lifted from: view-source:http://threejs.org/examples/webgl_shader2.html -->

    <script id="vertexShader" type="x-shader/x-vertex">

      varying vec2 vUv;

      void main()
      {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
      }

    </script>

    <script id="fragmentShader" type="x-shader/x-fragment">

      uniform float time;
      uniform float red;
      uniform float green;
      uniform float blue;
      uniform float index;
      // uniform vec2 resolution;

      varying vec2 vUv;

      void main( void ) {

        vec2 position = abs(-1.0 + 2.0 * vUv);

        float undulation = abs(sin(time + index));
        float edging = abs((pow(position.y, 5.0) + pow(position.x, 5.0)) / 2.0);
        float perc = 0.2 + undulation * 0.2 + edging * 0.6;
        float r = red * perc;
        float g = green * perc;
        float b = blue * perc;
        gl_FragColor = vec4( r, g, b, 1.0 );

      }

    </script>

<?PHP if ($local) { ?>
    <script src="js/origin.js"></script>
<?PHP } else { ?>
    <script src="origin.min.js"></script>
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-63027306-1', 'auto');
      ga('send', 'pageview');

    </script>
<?PHP } ?>
  </body>
</html>