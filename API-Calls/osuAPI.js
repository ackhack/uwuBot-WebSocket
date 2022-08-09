const { v2, auth } = require('osu-api-extended')
const KEYFILE = '../Dependencies/osuAPIKey.json';
let valid = false;
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
                v2.user.get(name, "osu").then(user => {
                    v2.scores.users.best(user.id, { mode: "osu", limit: 5 }).then(scores => {
                        ws.send(JSON.stringify(scores));
                    })
                })
                break;

            case 'recent':
                v2.user.get(name, "osu").then(user => {
                    v2.scores.users.recent(user.id, { mode: "osu", limit: 1 }).then(scores => {
                        ws.send(JSON.stringify(scores));
                    })
                })
                break;
        }
    }
}

init();

async function init() {
    try {
        let keyFile = require(KEYFILE);
        if (keyFile.id == "" || keyFile.id == undefined) return;
        if (keyFile.secret == "" || keyFile.secret == undefined) return;
        await auth.login(keyFile.id, keyFile.secret);

        console.log("osu! API is ready");
        valid = true;
    } catch (err) {
        console.log(err);
    }
}