const { header, footer } = require("./html");
const { writeFileInDir } = require("./io");

module.exports = async data => {
	try {
		const years = data
			.map(({ year, winner }) => {
				return `<a href='/years/${year}'>${year} ${winner ? winner : ""}</a>`;
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

		await writeFileInDir(deployRoot, "years/index.html", html);

		return true;
	} catch (err) {
		console.log("generateYearRoot error", err);
		return err;
	}
};
