const bus = require('./bus');
const bots = require('./bots');

const __DEV__ = process.env.NODE_ENV === 'dev';
const botsList = [];

Object.keys(bots).forEach(bot => {
  botsList.push(bots[bot]);
  if (__DEV__) {
    global[bot] = bots[bot];
    console.log(`Starting ${bot} bot`);
  }
});

bus.on('message', ({ platform, chat, name, message }) => {
  const botsToPropagateMsg = botsList.filter(bot => bot.platform != platform);
  botsToPropagateMsg.forEach(bot => {
    bot.send({ name, message, chat });
  });
  if (__DEV__) {
    console.log(`${platform} "${chat}": <${name}> ${message}`);
  }
});
