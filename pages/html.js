// also check header.php
const header = ({ title }) => `<html>
	<head>
		<title>${
			title ? `${title} - ` : ``
		}Stats Of Origin - State of Origin Statistics</title>
		<link rel="stylesheet" type="text/css" href='/css/origin.css'/>
		<link rel="icon" href="data:;base64,iVBORw0KGgo=">
		<meta name="viewport" content="initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,width=device-width,height=device-height,user-scalable=yes">
		<link href='http://fonts.googleapis.com/css?family=Roboto:900,400' rel='stylesheet' type='text/css'>
	</head>
	<body>
		<div id='container'>
			<div id='the-low-down'>
`;

const footer = ({ local }) => `
			</div>
		</div>${
			local
				? `<!-- no ga -->`
				: `<script>
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			ga('create', 'UA-63027306-1', 'auto');
			ga('send', 'pageview');
		</script>`
		}
	</body>
</html>`;

module.exports = { header, footer };
