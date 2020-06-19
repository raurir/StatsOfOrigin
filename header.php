<?PHP
// also check html.j
$local = $argv[1] === "dev";
?>
<html>
  <head>
    <title><?PHP echo ($title ? $title . " - " : ""); ?>StatsOfOrigin - State of Origin Statistics</title>
    <link rel="stylesheet" type="text/css" href='css/origin.css'/>
    <link rel="icon" href="data:;base64,iVBORw0KGgo=">
    <meta name="viewport" content="initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,width=device-width,height=device-height,user-scalable=yes">
    <link href='http://fonts.googleapis.com/css?family=Roboto:900,400' rel='stylesheet' type='text/css'>