const players = [];

const extractPoints = (t, type, attr) => {
	if (new RegExp(attr).test(type)) {
		if (t[attr]) {
			console.log(t);
			throw new Error("duplicate attr: " + attr);
		}
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
			if (!players.includes(p)) {
				players.push(p);
			}
		});
	}
};

const extract = (match, detail) => {
	const obj = {};
	let t;
	let total = -1;
	if (/Queensland/.test(detail)) {
		total =
			match.winner.team === "QLD" ? match.winner.score : match.loser.score;
		obj.qld = {
			total
		};
		t = obj.qld;
	}
	if (/New South Wales/.test(detail)) {
		total =
			match.winner.team === "NSW" ? match.winner.score : match.loser.score;
		obj.nsw = {
			total
		};
		if (t) throw new Error("duplicate state");
		t = obj.nsw;
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
			extractPoints(t, type, "tries");
			extractPoints(t, type, "goals");
			extractPoints(t, type, "conversions");
			extractPoints(t, type, "dropkicks");
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
	data
		// .splice(50, 5)
		// .filter(year => year.year === "2009")
		.map(year => {
			year.matches.map(match => {
				const { details } = match;
				let m = {};
				details.split("\n").forEach(detail => {
					m = Object.assign({}, m, extract(match, detail));
				});
				// console.log(year.year, m.nsw, m.qld);
				if (checkTotal(year, m.nsw) && checkTotal(year, m.qld)) {
					// good parsing buddy!
					// console.log("all good");
				} else {
					console.log("=======");
					console.log(year.matches.map(m => m.date));
					console.log(m);
				}
			});
		});
	return players;
};

module.exports = parse;
