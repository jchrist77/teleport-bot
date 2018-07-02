require('dotenv').config();
const Telegraf = require('telegraf');
const chalk = require('chalk');

const log = console;

const options = { username: '', channelMode: true };
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, options);

bot.use((ctx, next) => {
  const start = new Date();
  return next(ctx).then(() => {
    const ms = new Date() - start;
    console.log(chalk.gray(`[${new Date().toISOString()}]`), chalk.blue(`Response time ${ms}ms`));
  });
});

bot.catch(error => {
  log.error(error);
});

bot.start(ctx => ctx.reply('Welcome'));
bot.help(ctx => ctx.reply('Send me a sticker'));
bot.on('sticker', ctx => ctx.reply('👍'));
bot.hears('hi', ctx => ctx.reply('Hey there'));
bot.hears(/buy/i, ctx => ctx.reply('Buy-buy'));

bot.startPolling();

bot.telegram.getMe().then(info => {
  bot.options.username = info.username;
});
log.debug(chalk.gray(`[${new Date().toISOString()}]`), chalk.green(`Telegram bot started`), bot.options.username);

module.exports = bot;
