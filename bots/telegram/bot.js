// html-escaping only for telegram
const htmlEscape = str =>
  str
    ? str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    : '';

class TelegramBot {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.platform = 'TELEGRAM';
  }

  send({ name, message }) {
    const chat = this.config.chat;

    message = htmlEscape(message);
    name = htmlEscape(name);

    const template = this.config.messageTemplate || '<b>{name}</b>\n{message}';
    const textMessage = template.replace(/{.*?}/g, tag => {
      switch (tag) {
        case '{name}':
          return name;
        case '{message}':
          return message;
        default:
          return tag;
      }
    });

    this.client.telegram.sendMessage(chat.id, textMessage, { parse_mode: 'HTML' });
  }
}

module.exports = TelegramBot;
