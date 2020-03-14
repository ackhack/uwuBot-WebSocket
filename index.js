const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 60001 });
const Discord = require('discord.js');
const snoowrap = require('snoowrap');
const apiKey = require('./Dependencies/RedditAPI.json');
const redditAPI = new snoowrap({
    userAgent: 'my user-agent',
    clientId: apiKey.clientId,
    clientSecret: apiKey.clientSecret,
    username: apiKey.username,
    password: apiKey.password
});
const RiotAPIKey = require('./Dependencies/RiotAPIKey.json'); //Has RiotAPIKey under RiotAPIKey.key
const champions = require('./Files/champions.json');
let LeagueAPI = require('leagueapiwrapper');
LeagueAPI = new LeagueAPI(RiotAPIKey.key, Region.EUW);
const osu = require('node-osu');
const osuAPIKey = require('./Dependencies/osuAPIKey.json'); //Has APIKey under osuAPIKEY.key
const osuAPI = new osu.Api(osuAPIKey.key, {
    // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
    notFoundAsError: true, // Throw an error on not found instead of returning nothing. (default: true)
    completeScores: true, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
    parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
});

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log(message);
        let contentArgs = message.split(" "); //Split Message for simpler Access
        switch (contentArgs[0]) {
            case 'RedditAPI':
                redditAPI.getSubreddit(contentArgs[1]).getRandomSubmission().then(submission => {
                    ws.send(JSON.stringify(submission));
                }).catch(error => {
                    ws.send('ERROR');
                    console.log(error);
                });
                break;

            case 'LeagueAPI':
                name = getleagueName(message);

                LeagueAPI.getSummonerByName(name)
                    .then(async function (accountObject) {

                        return await LeagueAPI.getActiveGames(accountObject);
                    }).catch()
                    .then(function (activeGames) {

                        let mes = new Discord.RichEmbed();
                        mes.setTitle('LEAGUE GAME');

                        for (var x = 0; x < activeGames.participants.length; x++) {
                            let Link = '[' + activeGames.participants[x].summonerName + '](' + 'https://euw.op.gg/summoner/userName=' + activeGames.participants[x].summonerName.replace(/ /g, '_') + ')';
                            mes.addField(getChamp(activeGames.participants[x].championId), Link);
                        }
                        ws.send(JSON.stringify(mes));
                    })
                    .catch(error => {
                        ws.send('ERROR');
                        console.log(error);
                    });

                break;

            case 'osuAPI':
                switch (contentArgs[1]) {

                    case 'plays':
                        
                        name = getosuName(message);

                        osuAPI.getUserBest({ u: name }).then(scores => {
                            var emb = new Discord.RichEmbed()
                                .setTitle(name + '`s Top 5 Plays');
                            for (let index = 0; index < 5; index++) {
                                let Link = '[' + [scores[index].beatmap.title] + '](https://osu.ppy.sh/beatmapsets/' + scores[index].beatmap.beatmapSetId + '#osu/' + scores[index].beatmap.id + ')';
                                let n = index + 1;
                                emb.addField('#' + n,
                                    Link.concat("\nAcc: ").concat(scores[index].accuracy * 100).concat("\nPP: ").concat(scores[index].pp));
                            }
                            ws.send(JSON.stringify(emb));
                        }).catch((error) => {
                            ws.send('ERROR');
                            console.log(error);
                        });
                        break;

                    case 'recent':

                        name = getosuName(message);

                        osuAPI.getUserRecent({ u: name }).then( //osuAPI-Call
                            result => {
                                recentScore = result[0];

                                let ObjectCount = Number.parseInt(recentScore.beatmap.objects.normal) +
                                    Number.parseInt(recentScore.beatmap.objects.slider) +
                                    Number.parseInt(recentScore.beatmap.objects.spinner);

                                let ScoreCount = Number.parseInt(recentScore.counts["50"]) +
                                    Number.parseInt(recentScore.counts["100"]) +
                                    Number.parseInt(recentScore.counts["300"]) +
                                    Number.parseInt(recentScore.counts["miss"]);

                                let Acc = recentScore.accuracy * 100;
                                let percentagePassed = (ScoreCount / ObjectCount) * 100;
                                let parsedMods = parseMods(recentScore.mods);

                                var emb = new Discord.RichEmbed()
                                    .setTitle(recentScore.beatmap.artist + ' - ' + recentScore.beatmap.title)
                                    .setURL('https://osu.ppy.sh/beatmapsets/' + recentScore.beatmap.beatmapSetId + '#osu/' + recentScore.beatmap.id)
                                    .setColor('#0099ff')
                                    .setFooter(recentScore.date)
                                    .addField('Score', recentScore.score, true)
                                    .addField('Combo', recentScore.maxCombo, true)
                                    .addField('BPM', recentScore.beatmap.bpm, true)
                                    .addField('Status', recentScore.beatmap.approvalStatus)
                                    .addField('Difficulty', recentScore.beatmap.version, true)
                                    .addField('StarRating', parseFloat(recentScore.beatmap.difficulty.rating).toFixed(2), true)

                                if (!(parsedMods === "" || parsedMods == null)) {
                                    emb.addField('Mods', parsedMods, true)
                                }

                                if (percentagePassed !== 100) {
                                    emb.addField('Passed', percentagePassed.toFixed(2).concat("%"))
                                } else {
                                    emb.addBlankField()
                                }

                                emb.addField('Hits', recentScore.counts["300"].concat("EMOJI300 ")
                                    .concat(recentScore.counts["100"]).concat("EMOJI100 ")
                                    .concat(recentScore.counts["50"]).concat("EMOJI50 ")
                                    .concat(recentScore.counts["miss"]).concat("EMOJI0 "))

                                ws.send(JSON.stringify(emb));
                            }
                        ).catch((error) => {
                            ws.send('ERROR');
                            console.log(error);
                        });
                        break;
                }
                break;
        }
    });
});

function getChamp(ID) { //get Leaguechamp by ID
    for (var champ in champions.data) {
        c = champions.data[champ];
        if (c.key == ID) {
            return c.id;
        }
    }
}

function getleagueName(message) { //Gives back a NameString 

    name = message.substring(message.indexOf(' ')+1);

    if (name == null) { //Hardcoded Names
        switch (message.author.username) {

            case "ackhack": //Discordname
                return "ackhack"; //leaguename

            case "Human Daniel":
                return "Epicly Bad Gamer";

            case "LeftDoge":
                return "JohnTheVirtuoso";

            case "HST_Tutorials":
                return "HST KZSZ";

            default:
                return "No User given";
        }
    } else {
        return name;  //When Name given
    }
}

function getosuName(message) {       //Gives back a NameString 

    name = message.substring(message.indexOf(' ')+1);
    name = name.substring(name.indexOf(' ')+1);

    if (name == null) {   //Hardcoded Names
        switch (message.author.username) {

            case "ackhack":         //Discordname
                return "ackh4ck";   //osuname

            case "Human Daniel":
                return "Human Daniel";

            case "DragonHunter428":
                return "DH428";

            case 'Yalina':
                return 'IIAleII';

            default:
                return "No User given";
        }
    }
    else {
        return name;  //When Name given
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