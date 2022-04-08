const { Api } = require('node-osu');
const KEYFILE = '../Dependencies/osuAPIKey.json';
let valid = false;
let osu_api = undefined;

module.exports = {
    osuAPI: function (ws, args) {

        if (!valid) {
            ws.send('ERROR: osu! API is not available.');
            return;
        }

        let contentArgs = args.split(" "); //Split Message for simpler Access
        let name = args.substring(args.indexOf(' ') + 1);
        name = name.substring(name.indexOf(' ') + 1);

        switch (contentArgs[1]) {

            case 'plays':
                osu_api.getUserBest({ u: name }).then(
                    scores => {
                        var AccArray = [];
                        for (let s of scores) {
                            AccArray.push(s.accuracy);
                        }

                        ws.send(JSON.stringify([scores, AccArray]));
                    }).catch((error) => {
                        ws.send('ERROR: User not found or has no top plays.');
                        console.log(error);
                    });
                break;

            case 'recent':
                osu_api.getUserRecent({ u: name }).then(
                    result => {
                        ws.send(JSON.stringify([result[0], parseMods(result[0].mods), result[0].accuracy]));
                    }
                ).catch((error) => {
                    ws.send('ERROR: User not found or has no recent plays.');
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
    try {
        let keyFile = require(KEYFILE);
        if (keyFile.key == "" || keyFile.key == undefined) return;

        osu_api = new Api(keyFile.key, {
            // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
            notFoundAsError: true, // Throw an error on not found instead of returning nothing. (default: true)
            completeScores: true, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
            parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
        });
        console.log("osu! API is ready");
        valid = true;
    } catch (err) {
        console.log(err);
    }
}