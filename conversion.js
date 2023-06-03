const { parseStringPromise } = require("xml2js");
const fs = require("fs");

let tacticsData = JSON.parse(fs.readFileSync("tactics.json"));
let tactics = tacticsData.tactics;

async function convertXmlToTacticJson(xmlString, tacticName) {
  const parsedXml = await parseStringPromise(xmlString, {
    explicitArray: false,
  });
  const posElements = parsedXml.SoccerTactics.Pos.filter(
    (element) => element.$.pos === "normal"
  );

  const coordinates = posElements.map((element) => {
    const x = parseInt(element.$.x);
    const y = parseInt(element.$.y);
    const htmlLeft = x - 7;
    const htmlTop = y - 9;
    return [htmlLeft, htmlTop];
  });

  return {
    name: tacticName,
    coordinates: coordinates,
  };
}

async function addNewTactic(xmlString, tacticName) {
  const newTactic = await convertXmlToTacticJson(xmlString, tacticName);
  tactics.push(newTactic);
}

let tacticsToAdd = [
  {
    xmlString: ``,
    tacticName: "",
  },
  {
    xmlString: ``,
    tacticName: "",
  },
  // ...
];

Promise.all(
  tacticsToAdd.map((tactic) =>
    addNewTactic(tactic.xmlString, tactic.tacticName)
  )
)
  .then(() => {
    tactics.sort((a, b) => a.name.localeCompare(b.name));

    fs.writeFile(
      "tactics.json",
      JSON.stringify(tacticsData, null, 2),
      (err) => {
        if (err) throw err;
        console.log("Saved.");
      }
    );
  })
  .catch((error) => {
    console.error(error);
  });
