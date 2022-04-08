const API = require('twitch-api-v5');
const KEYFILE = '../Dependencies/TwitchID.json';
let valid = false;

module.exports = {
    TwitchAPI: function (ws, args) {

        ws.send('ERROR: Twitch API is out of date.');
        return;

        if (!valid) {
            ws.send('ERROR: Twitch API is not available.');
            return;
        }

        let contentArgs = args.split(' ');

        API.users.usersByName({ users: contentArgs[1] }, (err, res) => {
            if (err) {
                console.log(err);
                ws.send('Offline ' + contentArgs[1]);
            } else {
                console.log(res);

                API.streams.live({ channel: res.users[0]._id }, (err1, res) => {

                    if (err1) {
                        console.log(err1);
                        ws.send('Offline ' + contentArgs[1]);
                    } else {

                        if (res.streams.length > 0) {
                            ws.send('Online ' + contentArgs[1]);
                        } else {
                            ws.send('Offline ' + contentArgs[1]);
                        }
                    }
                })
            }
        })
    }
}

init();

function init() {
    try {
        let keyFile = require(KEYFILE);
        if (keyFile.key == "" || keyFile.key == undefined) return;

        API.clientID = keyFile.key;
        console.log("Twitch API is ready");
        valid = true;
    } catch (err) {
        console.log(err);
    }
}