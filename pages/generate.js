const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

const local = true;

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
    <div id='the-low-down'>
`;

const footer = ({ local }) => `${
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
    </div>
  </body>
</html>`;

const writeFileInDir = async (path, file, data) => {
  const fullPath = path + file;
  console.log("writing:", fullPath);
  let createDir = false;
  try {
    await writeFile(fullPath, data);
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
    return true;
  } catch (err) {
    console.log("writeFileInDir - mkdir & writeFile error", err);
    return false;
  }
};

const generate = async () => {
  try {
    const buffer = await readFile("../js/data.js");
    const string = buffer.toString();
    // strip off `var years = `
    const stringObject = string.substr(12);
    // cannot JSON.parse because it's malformed JSON.
    const data = eval(stringObject);
    const yearRoot = await generateYearRoot(data);
    if (!yearRoot) console.log("generate error creating yearRoot");
    const years = await Promise.all(data.map(generateYear));
    if (!years.every(Boolean))
      console.log("generate error creating years", years);
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
      .join("\n");

    const html = `${header({ title: "Years" })}
    <div>
      ${years}
    </div>
    ${footer({ local })}`;

    await writeFileInDir("../deploy/years/", "index.html", html);

    return true;
  } catch (err) {
    console.log("generateYearRoot error", err);
    return err;
  }
};

const generateYear = async data => {
  try {
    // console.log(JSON.stringify(data, null, " "));
    const { NSW, QLD, winner, matches, year } = data;
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
      <div><a href='/years/'>Back to years</a>
      <div><a href='/years/${Number(year) - 1}'>Prev</a>
      <div><a href='/years/${Number(year) + 1}'>Next</a>
    </div>
    ${footer({ local })}`;

    await writeFileInDir(`../deploy/years/${year}/`, "index.html", html);
    return true;
  } catch (err) {
    console.log("generateYear error", err);
    return err;
  }
};

generate();
