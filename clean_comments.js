
const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== "node_modules" && f !== ".git" && f !== "dist") {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith(".js") || f.endsWith(".jsx")) {
        callback(dirPath);
      }
    }
  });
}

const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

walkDir("./server", processFile);
walkDir("./client/src", processFile);

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  
  // Remove JSDoc blocks /** ... */
  content = content.replace(/\/\*\*[\s\S]*?\*\//g, "");
  
  // Remove numbered comments: // 1. Do something
  content = content.replace(/^\s*\/\/\s*\d+\..*$/gm, "");
  
  // Remove comments with emojis
  let lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.trim().startsWith("//") && emojiRegex.test(line)) {
      lines[i] = "";
    }
  }
  content = lines.join("\n");
  
  // Strip multiple consecutive blank lines to just one
  content = content.replace(/\n\s*\n\s*\n/g, "\n\n");
  
  fs.writeFileSync(filePath, content, "utf-8");
}
console.log("Cleanup complete!");

