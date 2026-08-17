const fs = require("fs");
const path = require("path");

const genIndex = function (markup) {
  let html = fs.readFileSync(path.join(__dirname, "../src/template.html"), {
    encoding: "utf-8",
  });

  let readTime = "",
    readVar = "";

  if (markup.length) {
    readTime = (markup.split(" ").length / 200) * 60;
    readVar = `<style>:root{
      --readTime: ${Math.round(readTime) + 15}s;
    }</style>`;
  }

  html = html
    .replace(/\{\{\^READ_TIME\}\}/g, readVar)
    .replace(/\{\{\^SCROLL_MSG\}\}/g, markup)
    .replace(
      /\{\{\^HBD_MSG\}\}/g,
      process.env.HBD_MSG || "Wish you a very Happy Birthday"
    )
    .replace(/\{\{\^NAME\}\}/g, process.env.NAME || "Friend")
    .replace(/\{\{\^NICKNAME\}\}/g, process.env.NICKNAME || process.env.NAME || "Friend");


  fs.writeFileSync(path.join(__dirname, "../src/index.html"), html, {
    encoding: "utf-8",
  });
  console.log("Index Generated");
};

module.exports = genIndex;
