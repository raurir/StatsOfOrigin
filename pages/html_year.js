const { header, footer } = require("./html");
const { writeFileInDir } = require("./io");

const renderPointType = (type, points) => {
	if (!points || points.length == 0) {
		return false;
	}
	var o = {};
	points.forEach(v => (o[v] ? o[v]++ : (o[v] = 1)));
	return `${type}: ${Object.entries(o)
		.map(([k, v]) => (v === 1 ? k : `${k} x ${v}`))
		.join(", ")}`;
};

const renderPoints = m => {
	let points = [`Total ${m.total}`];
	points.push(renderPointType("Tries", m.tries));
	points.push(renderPointType("Goals", m.goals));
	points.push(renderPointType("Conversions", m.conversions));
	points.push(renderPointType("Dropkicks", m.dropkicks));
	return points.filter(Boolean).join("<br>");
};

const renderMatch = match => {
	const {
		date,
		details,
		winner,
		loser,
		referee,
		ground,
		crowd,
		QLD,
		NSW
	} = match;
	return `
			<div style="flex:1">
				<h3>${date} @ ${ground}</h3>
				<p>
					${winner.team} beat ${loser.team}
					by ${winner.score} to ${loser.score}
				</p>
				<h4>Queensland</h4>
				<p>${renderPoints(QLD)}</p>
				<h4>New South Wales</h4>
				<p>${renderPoints(NSW)}</p>
				<p>Referee was ${referee} with a crowd of ${crowd}.</p>
			</div>`;
};

module.exports = async (data, index, array) => {
	try {
		// console.log(JSON.stringify(data, null, " "));
		const { NSW, QLD, winner, matches, year } = data;

		const html = `${header({ title: `Year ${year}` })}
		<div>
			<h1>Stats Of Origin</h1>
			<h2>${year}</h2>
			<h2>${
				winner ? `${winner} won` : `Series in progress`
			} (NSW ${NSW}:QLD ${QLD})</h2>
			<h2>Matches</h2>
			<div style='display:flex;'>
				${matches.map(renderMatch).join("")}
			</div>
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

		await writeFileInDir(deployRoot, `years/${year}/index.html`, html);
		return true;
	} catch (err) {
		console.log("generateYear error", err);
		return err;
	}
};
