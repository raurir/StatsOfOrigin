const robots = require("./robots");
const sitemap = require("./sitemap");
const { getPaths, readFile, writeFileInDir } = require("./io");
const { header, footer } = require("./html");
const parse = require("./players");

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
const local = false;

const generate = async () => {
	try {
		const buffer = await readFile("../js/data.js");
		const string = buffer.toString();
		// strip off `var years = `
		const stringObject = string.substr(12);
		// cannot JSON.parse because it's malformed JSON.
		const data = eval(stringObject);

		const players = parse(data);
		// console.log(players.sort());
		return;

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
		const paths = getPaths();
		const xml = sitemap(paths);
		await writeFileInDir(root, "sitemap.xml", xml);
		await writeFileInDir(root, "robots.txt", robots);

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
