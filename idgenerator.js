const fs = require("fs");
const path = require("path");
const jsSHA = require("jssha");

function generateId(coordinates) {
  const sortedCoordinates = coordinates.sort(
    (a, b) => a[1] - b[1] || a[0] - b[0]
  );
  const coordString = sortedCoordinates
    .map((coord) => `${coord[1]}_${coord[0]}`)
    .join("_");
  return sha256(coordString);
}

function sha256(str) {
  const shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.update(str);
  const hash = shaObj.getHash("HEX");
  return hash;
}

const tacticsPath = path.join(__dirname, "json", "tactics.json");
const tacticsJson = JSON.parse(fs.readFileSync(tacticsPath, "utf8"));

for (const tactic of tacticsJson.tactics) {
  tactic.id = generateId(tactic.coordinates);
}

fs.writeFileSync(tacticsPath, JSON.stringify(tacticsJson, null, 2));
