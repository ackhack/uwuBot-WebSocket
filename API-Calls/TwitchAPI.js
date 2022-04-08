const API = require('twitch-api-v5');
const fs = require('fs');
const KEYFILE = '../Dependencies/TwitchID.json';

module.exports = {
    TwitchAPI: function (ws, args) {

        if (API.clientID === undefined) {
            ws.send('ERROR: Twitch API is not available.');
            return;
        }

        let contentArgs = args.split(' ');

        API.users.usersByName({ users: contentArgs[1] }, (err, res) => {
            if (err) {
                console.log(err);
                ws.send('Offline ' + contentArgs[1]);
            } else {

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
    if (fs.existsSync(KEYFILE)) {
        API.clientID = require(KEYFILE).key;
    }
}