// Code from: https://github.com/sz-piotr/js13k-webpack-starter/blob/master/postbuild.js
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

let output = fs.createWriteStream("./build.zip");
let archive = archiver("zip", {
  zlib: { level: 9 }, // set compression to best
});

const MAX = 13 * 1024; // 13kb

output.on("close", function () {
  const bytes = archive.pointer();
  const percent = ((bytes / MAX) * 100).toFixed(2);
  if (bytes > MAX) {
    console.error(`Size overflow: ${bytes} bytes (${percent}%)`);
  } else {
    console.log(`Size: ${bytes} bytes (${percent}%)`);
  }
});

archive.on("warning", function (err) {
  if (err.code === "ENOENT") {
    console.warn(err);
  } else {
    throw err;
  }
});
archive.on("error", function (err) {
  throw err;
});
archive.pipe(output);

[
  "./dist/index.html",
  "./dist/main.js",
  "./dist/favicon.ico",
  "./dist/blue_flower.png",
  "./dist/cone.png",
  "./dist/roller.png",
  "./dist/tiles.png",
  "./dist/vine.png",
].forEach((file) => {
  archive.append(fs.createReadStream(file), {
    name: path.basename(file),
  });
});

archive.finalize();
