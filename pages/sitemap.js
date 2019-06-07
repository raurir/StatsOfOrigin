`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>http://www.example.com/</loc>
		<lastmod>2005-01-01</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc>http://www.example.com/catalog?item=12&amp;desc=vacation_hawaii</loc>
		<changefreq>weekly</changefreq>
	</url>
	<url>
		<loc>http://www.example.com/catalog?item=73&amp;desc=vacation_new_zealand</loc>
		<lastmod>2004-12-23</lastmod>
		<changefreq>weekly</changefreq>
	</url>
	<url>
		<loc>http://www.example.com/catalog?item=74&amp;desc=vacation_newfoundland</loc>
		<lastmod>2004-12-23T18:00:15+00:00</lastmod>
		<priority>0.3</priority>
	</url>
	<url>
		<loc>http://www.example.com/catalog?item=83&amp;desc=vacation_usa</loc>
		<lastmod>2004-11-23</lastmod>
	</url>
</urlset>`;

const static = [
	{ loc: "index.html", lastmod: "2019-06-06" },
	{ loc: "about.html", lastmod: "2019-06-06" }
];

const sitemap = urls => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
	.map(item)
	.join("")}
</urlset>`;

const item = ({ path, lastmod }) => `
	<url>
		<loc>http://www.statsoforigin.com/${path}</loc>
		<lastmod>${lastmod}</lastmod>
	</url>`;

module.exports = data => sitemap(static.concat(data));
