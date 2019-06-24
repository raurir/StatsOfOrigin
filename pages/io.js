const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);

const paths = [];
const writeFileInDir = async (relativeRoot, webPath, data) => {
	const fullPath = relativeRoot + webPath;
	let createDir = false;

	// check exists and compare if it does
	try {
		const existing = await readFile(fullPath);
		const stati = await stat(fullPath);
		// console.log(stati.atime, stati.mtime, stati.ctime);
		if (existing.toString() === data.toString()) {
			console.log("existing");
			addToPaths(webPath, format(stati.mtime));
			return true;
		}
	} catch (err) {
		// expecting file not to exist
		if (err.code !== "ENOENT") {
			console.log("writeFileInDir - readFile error", err);
			return false;
		}
	}

	// attempt to write to file
	try {
		await writeFile(fullPath, data);
		console.log("written path", fullPath);
		addToPaths(webPath);
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

	// attempt to create folder and write to file
	try {
		const path = fullPath.substr(0, fullPath.lastIndexOf("/") + 1);
		console.log("creating path", path);
		await mkdir(path);
		await writeFile(fullPath, data);
		addToPaths(webPath);
		return true;
	} catch (err) {
		console.log("writeFileInDir - mkdir & writeFile error", err);
		return false;
	}
};

const format = d =>
	["" + d.getFullYear(), "0" + (d.getMonth() + 1), "0" + d.getDate()]
		.map((c, i) => c.slice(-[4, 2, 2][i]))
		.join("-");
const today = format(new Date());

const getPaths = () => paths;
const addToPaths = (path, lastmod = today) => paths.push({ path, lastmod });

module.exports = {
	getPaths,
	readFile,
	writeFileInDir
};
