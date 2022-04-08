const { LolApi } = require('twisted');
const fs = require('fs');
const KEYFILE = '../Dependencies/RiotAPIKey.json';
let league_api = undefined;
let gameModes = undefined;
let maps = undefined;
let SavedGames = {};

module.exports = {
    LeagueAPI: async function (ws, args) {

        if (league_api === undefined) {
            ws.send('ERROR: League API is not available.');
            return;
        }

        let name = args.substring(args.indexOf(' ') + 1);

        await api.Summoner.getByName(name, 'EUW1').catch(_ => {
            ws.send('ERROR: Summoner not found');
        }).then(async user => {

            if (!user)
                return;

            await api.Spectator.activeGame(user.response.id, 'EUW1').catch(_ => {
                ws.send('ERROR: No active Game');
            }).then(async currentMatch => {

                if (!currentMatch)
                    return;

                if (!currentMatch.response) {
                    ws.send('ERROR: No active Game');
                    return;
                }

                if (SavedGames[currentMatch.response.gameId]) { //Skip API-Calls below if game is already saved
                    ws.send(JSON.stringify(SavedGames[currentMatch.response.gameId]));
                }

                let gameInfo = '';
                if (currentMatch.response.gameMode == 'CLASSIC')
                    gameInfo = 'Normal or Ranked Game on ';
                else
                    gameInfo = gameInfo.concat(gameModes.find(mode => mode.gameMode == currentMatch.response.gameMode)).concat(' on ');


                let map = maps.find(mode => mode.mapId == currentMatch.response.mapId);

                gameInfo = gameInfo.concat(map['mapName'] + ' (' + map['notes'] + ')');


                let Players = [];

                for (let par of currentMatch.response.participants) {

                    let champ = twisted.Constants.Champions[par.championId];
                    champ = champ.charAt(0) + champ.substring(1, champ.length).toLowerCase(); //First Letter UpperCase
                    champ = champ.replace(/_(.)/g, function (m) { return ' ' + m.charAt(1).toUpperCase() }); //Replace '_l' with ' L'

                    let pl = await api.Summoner.getByName(par.summonerName, 'EUW1').catch(_ => {
                        ws.send('ERROR: Name not found');
                        return;
                    });;
                    let px = await api.League.bySummoner(par.summonerId, 'EUW1').catch(_ => {
                        ws.send('ERROR: Summoner not found');
                        return;
                    });;

                    var rank = 'Unranked';
                    if (px.response[0] != undefined) {
                        rank = px.response[0].tier.charAt(0) + px.response[0].tier.substring(1, px.response[0].tier.length).toLowerCase() + ' ' + px.response[0].rank;
                    }

                    Players.push(new Player(par.summonerName, champ, rank, 'lvl ' + pl.response.summonerLevel))
                }

                let game = [currentMatch.response.gameId, Players, name, gameInfo];

                SavedGames[currentMatch.response.gameId] = game;

                setTimeout(_ => { //Delete game after 2 hours
                    SavedGames[currentMatch.response.gameId] = undefined;
                }, 7_200_000)

                ws.send(JSON.stringify(game));
            });
        });
    }
}


init();

function init() {
    if (fs.existsSync(KEYFILE)) {
        league_api = new LolApi({
            rateLimitRetry: true,
            rateLimitRetryAttempts: 1,
            concurrency: undefined,
            key: require(KEYFILE).key,
        });
        gameModes = require('../Files/gameModes.json');
        maps = require('../Files/maps.json');
    }
}

class Player {
    constructor(name, champion, rank, playerlevel) {
        this.name = name;
        this.champion = champion;
        this.rank = rank;
        this.playerlevel = playerlevel;
    }
}