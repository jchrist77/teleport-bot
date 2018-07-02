const config = require('../../config.json');
const DiscordBot = require('./bot');
const client = require('./client');

const bot = new DiscordBot(client, config.discord);

module.exports = bot;
