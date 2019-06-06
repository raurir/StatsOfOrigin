const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

const sitemap = require("./sitemap");

if (!Array.prototype.flat) {
	Array.prototype.flat = function(depth) {
		var flattend = [];
		(function flat(array, depth) {
			for (let el of array) {
				if (Array.isArray(el) && depth > 0) {
					flat(el, depth - 1);
				} else {
					flattend.push(el);
				}
			}
		})(this, Math.floor(depth) || 1);
		return flattend;
	};
}

const root = "../deploy/";
const paths = [];
const local = false;

const header = ({ title }) => `<html>
	<head>
		<title>${
			title ? `${title} - ` : ``
		}Stats Of Origin - State of Origin Statistics</title>
		<link rel="stylesheet" type="text/css" href='/css/origin.css'/>
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

const writeFileInDir = async (relativeRoot, webPath, data) => {
	const fullPath = relativeRoot + webPath;
	let createDir = false;
	try {
		await writeFile(fullPath, data);
		// console.log("writing:", fullPath);
		paths.push(webPath);
		return true;
	} catch (err) {
		if (err.code === "ENOENT") {
			// expected error: folder does not exist
			createDir = true;
		} else {
			console.log("writeFileInDir - writeFile error", err);
			return false;
		}
	}
	if (!createDir) {
		console.log("writeFileInDir - createDir error...");
		return;
	}
	try {
		await mkdir(path);
		await writeFile(fullPath, data);
		// console.log("writing:", fullPath);
		paths.push(webPath);
		return true;
	} catch (err) {
		console.log("writeFileInDir - mkdir & writeFile error", err);
		return false;
	}
};

/*
generate error TypeError: Z.Niszczot 2 is not a function
		at Array.map (<anonymous>)
*/

const people = [];

const extractPoints = (t, type, attr) => {
	if (new RegExp(attr).test(type)) {
		if (t[attr]) throw new Error("duplicate attr: " + attr);
		t[attr] = type
			.replace(` ${attr}`, "")
			.split(",")
			.map(person => {
				let lastBit = person.split(" ");
				lastBit = lastBit[lastBit.length - 1];
				const n = Number(lastBit);
				if (n === Number(lastBit)) {
					const index = person.lastIndexOf(lastBit) - 1;
					const p = person.substr(0, index);
					person = Array(n).fill(p);
				}
				return person;
			})
			.flat();

		t[attr].forEach(p => {
			if (!people.includes(p)) {
				people.push(p);
			}
		});
	}
};

const extract = (match, detail) => {
	const obj = {};
	let t;
	if (/Queensland/.test(detail)) {
		obj.qld = {
			// total: detail.split(" ")[1]
			total:
				match.winner.team === "QLD" ? match.winner.score : match.loser.score
		};
		t = obj.qld;
	}
	if (/New South Wales/.test(detail)) {
		obj.nsw = {
			total:
				match.winner.team === "NSW" ? match.winner.score : match.loser.score
		};
		if (t) throw new Error("duplicate state");
		t = obj.nsw;
	}
	if (!t) return; ///throw new Error("no year");
	// t.total = Number(t && t.total);

	const d = detail.match(/\((.*)\)/);
	if (!(d && d[1])) {
		return console.log("no game details");
	}
	d[1].split(";").map(type => {
		extractPoints(t, type, "tries");
		extractPoints(t, type, "goals");
		extractPoints(t, type, "conversions");
		extractPoints(t, type, "dropkicks");
		// TODO penalty goals
	});
	return obj;
};

const parse = data =>
	data
		//.splice(0, 3) //
		// .filter(year => year.year === "2018")
		.map(year => {
			year.matches.map(match => {
				const { details } = match;
				let m = {};
				details.split("\n").forEach(detail => {
					m = Object.assign({}, m, extract(match, detail));
				});
				// console.log(year.year, m);
			});
		});

const generate = async () => {
	try {
		const buffer = await readFile("../js/data.js");
		const string = buffer.toString();
		// strip off `var years = `
		const stringObject = string.substr(12);
		// cannot JSON.parse because it's malformed JSON.
		const data = eval(stringObject);

		// parse(data);
		// console.log(people.sort());
		// return;
		const yearRoot = await generateYearRoot(data);
		if (!yearRoot) console.log("generate error creating yearRoot");
		const years = await Promise.all(
			data
				// .slice(0, 3) // ok
				.map(generateYear)
		);
		if (!years.every(Boolean))
			console.log("generate error creating years", years);

		// must run this last because it pushes to `paths`
		const xml = sitemap(paths);
		await writeFileInDir(root, "sitemap.xml", xml);

		console.log("generate complete");
	} catch (err) {
		console.log("generate error", err);
	}
};

const generateYearRoot = async data => {
	try {
		const years = data
			.map(({ year, winner }) => {
				return `<a href='/years/${year}'>${year} ${winner}</a>`;
			})
			.join(" | \n");

		const html = `${header({ title: "Years" })}
		<div>
			<h1>Years</h1>
			<h2>State of Origin year by year</h2>
			${years}
			<div>
				<a href="/index.html" class="button">Home</a>
				<a href="/about.html" class="button">About</a>
			</div>
		</div>
		${footer({ local })}`;

		await writeFileInDir(root, "years/index.html", html);

		return true;
	} catch (err) {
		console.log("generateYearRoot error", err);
		return err;
	}
};

const generateYear = async (data, index, array) => {
	try {
		// console.log(JSON.stringify(data, null, " "));
		const { NSW, QLD, winner, matches, year } = data;

		// console.log("========");
		// console.log(year);

		const html = `${header({ title: `Year ${year}` })}
		<div>
			<h1>Stats Of Origin</h1>
			<h2>${year}</h2>
			<h2>${winner} won (NSW ${NSW}:QLD ${QLD})</h2>
			<h2>Matches</h2>${matches
				.map(match => {
					const {
						date,
						details,
						winner: matchWinner,
						loser: matchLoser,
						referee,
						ground,
						crowd
					} = match;
					return `
			<div>
				<h3>${date} @ ${ground}</h3>
				<p>
					${matchWinner.team} beat ${matchLoser.team}
					by ${matchWinner.score} to ${matchLoser.score}
				</p>
				<p>Referee was ${referee} with a crowd of ${crowd}.</p>
				<p>${details}</p>
			</div>`;
				})
				.join("")}
			<div>
				${
					index > 0
						? `<a href='/years/${Number(year) -
								1}/index.html' class="button">Prev</a>`
						: ``
				}
				<a href='/years/' class="button">Back to years</a>
				${
					index < array.length - 1
						? `<a href='/years/${Number(year) +
								1}/index.html' class="button">Next</a>`
						: ``
				}
			</div>
		</div>
		${footer({ local })}`;

		await writeFileInDir(root, `years/${year}/index.html`, html);
		return true;
	} catch (err) {
		console.log("generateYear error", err);
		return err;
	}
};

generate();
