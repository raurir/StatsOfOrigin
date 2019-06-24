const { resolve } = require("path");

const robots = require("./robots");
const sitemap = require("./sitemap");
const { getPaths, readFile, writeFileInDir } = require("./io");
const parse = require("./players");

const generateYear = require("./html_year");
const generateYearsIndex = require("./html_years_index");

global.deployRoot = resolve(__dirname + "/../deploy/") + "/";
global.local = false;

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

const generate = async () => {
	try {
		const buffer = await readFile(__dirname + "/../js/data.js");
		const string = buffer.toString();
		// strip off `var years = `
		const stringObject = string.substr(12);
		// cannot JSON.parse because it's malformed JSON.
		const data = eval(stringObject);

		const players = parse(data);
		// console.log(JSON.stringify(players.sort(), null, " "));
		// return;
		// const data = parse(data1);

		// const best = data1.reduce((acc, y) => {
		// 	const delta = y.matches.map(game => {
		// 		const { winner, loser } = game;
		// 		// console.log(game);
		// 		return { y, delta: winner.score - loser.score };
		// 	});
		// 	return acc.concat(delta);
		// }, []);

		// console.log(
		// 	JSON.stringify(
		// 		best.sort((a, b) => a.delta - b.delta).slice(-3),
		// 		null,
		// 		" "
		// 	)
		// );
		// return;

		const yearRoot = await generateYearsIndex(data);
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
		await writeFileInDir(deployRoot, "sitemap.xml", xml);
		await writeFileInDir(deployRoot, "robots.txt", robots);

		console.log("generate complete");
	} catch (err) {
		console.log("generate error", err);
	}
};

generate();
