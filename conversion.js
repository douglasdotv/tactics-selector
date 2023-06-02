const { parseStringPromise } = require("xml2js");

async function convertXmlToTacticJson(xmlString, tacticName) {
  const parsedXml = await parseStringPromise(xmlString, {
    explicitArray: false,
  });
  const posElements = parsedXml.SoccerTactics.Pos.filter(element => element.$.pos === "normal");

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
