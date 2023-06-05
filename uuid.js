const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

fs.readFile('tactics.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error while reading json:', err);
        return;
    }

    let parsedData = JSON.parse(data);
    parsedData.tactics = parsedData.tactics.map(tactic => {
        return {
            ...tactic,
            id: uuidv4()
        };
    });

    fs.writeFile('tactics.json', JSON.stringify(parsedData, null, 2), (err) => {
        if (err) {
            console.error('Error while saving json: ', err);
        } else {
            console.log('Saved.');
        }
    });
});
