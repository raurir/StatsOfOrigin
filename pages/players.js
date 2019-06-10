const stringSimilarity = require("string-similarity");
const { prompt } = require("enquirer");

const audit = async data => {
	var d = data.map(v =>
		Object.assign({}, v, {
			onCancel: (name, value, prompt) => {
				console.log(prompt.state.answers);
			}
		})
	);
	try {
		const response = await prompt(d);
		console.log(response);
	} catch (err) {}
};

const players = [];

const extractPoints = (year, match, t, type, attr) => {
	if (new RegExp(attr).test(type)) {
		if (t[attr]) {
			console.log(t);
			throw new Error("duplicate attr: " + attr);
		}
		t[attr] = type
			.replace(` ${attr}`, "")
			.split(",")
			.map(person => {
				const lastBit = person.split(" ").pop();
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
			const found = players.find(player => player.name === p);
			if (found) {
				found.years.push(year.year);
				found.years = [...new Set(found.years)]; // remove duplicates :)
				if (!found[attr]) {
					found[attr] = 1;
				} else {
					found[attr]++;
				}
			} else {
				players.push({ name: p, years: [year.year], [attr]: 1 });
			}
		});
	}
};

const extract = (year, match, detail) => {
	const obj = {};
	let t;
	let total = -1;
	if (/Queensland/.test(detail)) {
		total =
			match.winner.team === "QLD" ? match.winner.score : match.loser.score;
		obj.QLD = {
			total
		};
		t = obj.QLD;
	}
	if (/New South Wales/.test(detail)) {
		total =
			match.winner.team === "NSW" ? match.winner.score : match.loser.score;
		obj.NSW = {
			total
		};
		if (t) throw new Error("duplicate state");
		t = obj.NSW;
	}
	if (total === 0) return obj;
	if (total === -1) return console.log("total is negative");
	if (!t) return console.log("error no year");

	const d = detail.match(/\((.*)\)/);
	if (!(d && d[1])) {
		return console.log("no game details", detail);
	}
	try {
		d[1].split(";").map(type => {
			extractPoints(year, match, t, type, "tries");
			extractPoints(year, match, t, type, "goals");
			extractPoints(year, match, t, type, "conversions");
			extractPoints(year, match, t, type, "dropkicks");
			// TODO penalty goals
		});
	} catch (err) {
		console.log(err);
		console.log("match", match);
	}
	return obj;
};

const checkTotal = (year, m) => {
	if (!m) {
		// console.log("checkTotal undefined:", m);
		return false;
	}
	// TODO document value change in years index
	const valueTry = Number(year.year) < 1983 ? 3 : 4;
	let total = 0;
	total += ((m.tries && m.tries.length) || 0) * valueTry;
	total += ((m.goals && m.goals.length) || 0) * 2;
	total += ((m.conversions && m.conversions.length) || 0) * 2;
	total += ((m.dropkicks && m.dropkicks.length) || 0) * 1;
	const ok = m.total === total;
	if (!ok) {
		console.log("totals should be:", m.total, "got:", total);
	}
	return ok;
};

const parse = data => {
	const format = data
		// .splice(0, 1)
		// .filter(year => year.year === "2009")
		.map(year => {
			const breakdown = year.matches.map(match => {
				const { details } = match;
				let m = {};
				details.split("\n").forEach(detail => {
					m = Object.assign({}, m, extract(year, match, detail));
				});
				// console.log(year.year, m.NSW, m.QLD);
				if (checkTotal(year, m.NSW) && checkTotal(year, m.QLD)) {
					// good parsing buddy!
					// console.log("all good");
				} else {
					console.log("=======\nError:");
					console.log(year.matches.map(m => m.date));
					console.log(m);
				}
				return m;
				// return match; //Object.assign({}, match, m);
			});
			const matches = year.matches.map((match, i) => {
				return Object.assign(match, breakdown[i]);
			});
			// return matches;
			const m = Object.assign({}, year);
			m.matches = matches;
			return m;
		});
	// console.log(JSON.stringify(format, null, " "));
	return format;

	const names = players.map(p => p.name.replace(/[\.\s/]/g, "_"));
	// console.log(names.sort());
	// console.log(names.length);
	/*
	// find duplicates and similarities
	const problems = players
		// .filter(p => /(smith)/i.test(p.name))
		// .slice(0, 4)
		.map((p, i) => {
			const bestMatches = stringSimilarity.findBestMatch(p.name, names);
			const bestMatchIndex = bestMatches.bestMatchIndex;
			const mp = players[bestMatchIndex];

			const matches = bestMatches.ratings.filter(
				match => match.rating > 0.4 && match.rating < 1
			);
			if (matches.length) {
				return {
					type: "confirm",
					name: p.name.replace(/\./g, "_"),
					message: `${p.name}:${p.years.join(",")} \n\t${matches
						.map(match => {
							// console.log(match.target);
							// return match.target;
							const pm = players.find(pm => pm.name === match.target);
							return `${pm.name}:${pm.years.join(",")}`;
						})
						.join("\n\t")}`
				};
			} else {
				return false;
			}
		})
		.filter(Boolean);

	audit(problems);
	*/

	players.sort((a, b) => (a.tries || 0) - (b.tries || 0));

	return players;
};

module.exports = parse;
