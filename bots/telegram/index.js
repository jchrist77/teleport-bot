const config = require('../../config.json');
const TelegramBot = require('./bot');
const client = require('./client');

const bot = new TelegramBot(client, config.telegram);

module.exports = bot;
