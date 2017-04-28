<?PHP
include "header.php";
?>
  </head>
  <body>
    <div id='container'>
      <div id='header'>
        <div id='debug'></div>
        <h1>StatsOfOrigin - State of Origin Statistics 1982 - 2017</h1>
        <h4 id='stat'></h4>
      </div>
      <div class='button-show-state button' id='show-NSW'>NSW</div>
      <div class='button-show-state button' id='show-QLD'>QLD</div>
      <div id='webglcontainer'></div>
      <svg id="svgcontainer"></svg>
      <div id="buttons">
        <h4 id='buttons-help'>Drag the graph to explore or Select an option below</h4>
        <a class="button" href="/index.php">Graphs</a>
      </div>
    </div>
<?PHP
include "footer.php";
?>