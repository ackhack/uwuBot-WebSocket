const { Api } = require('node-osu');
const fs = require('fs');
const KEYFILE = '../Dependencies/osuAPIKey.json';
let osu_api = undefined;

module.exports = {
    osuAPI: function (ws, args) {

        if (osu_api === undefined) {
            ws.send('ERROR: osu! API is not available.');
            return;
        }

        let contentArgs = args.split(" "); //Split Message for simpler Access
        let name = args.substring(args.indexOf(' ') + 1);
        name = name.substring(name.indexOf(' ') + 1);

        switch (contentArgs[1]) {

            case 'plays':
                osuAPI.getUserBest({ u: name }).then(
                    scores => {
                        var AccArray = [];
                        for (let s of scores) {
                            AccArray.push(s.accuracy);
                        }

                        ws.send(JSON.stringify([scores, AccArray]));
                    }).catch((error) => {
                        ws.send('ERROR');
                        console.log(error);
                    });
                break;

            case 'recent':
                osuAPI.getUserRecent({ u: name }).then( //osuAPI-Call
                    result => {
                        ws.send(JSON.stringify([result[0], parseMods(result[0].mods), result[0].accuracy]));
                    }
                ).catch((error) => {
                    ws.send('ERROR');
                    console.log(error);
                });
                break;
        }
    }
}

function parseMods(mods) {
    let result = "";
    for (let x = 0; x < mods.length; x++) {

        if (mods[x] != 'FreeModAllowed' && mods[x] != 'ScoreIncreaseMods') {
            result += mods[x] + ',';
        }
    }

    result = result.substring(0, result.length - 1);
    return result;
}

init();

function init() {
    if (fs.existsSync(KEYFILE)) {
        osu_api = new Api(require(KEYFILE).key, {
            // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
            notFoundAsError: true, // Throw an error on not found instead of returning nothing. (default: true)
            completeScores: true, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
            parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
        });
    }
}