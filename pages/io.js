const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

const paths = [];
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
		const path = fullPath.substr(0, fullPath.lastIndexOf("/") + 1);
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

const getPaths = () => paths;

module.exports = {
	getPaths,
	readFile,
	writeFileInDir
};
