class DiscordBot {
  constructor(client, config) {
    this.client = client;
    this.config = config;
    this.platform = 'DISCORD';
  }

  send({ name, message }) {
    //message = htmlEscape(message);
    //name = htmlEscape(name);
    /*
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
*/
    //this.client.telegram.sendMessage(chat.id, textMessage, { parse_mode: 'HTML' });
    console.log(`Sending ${this.platform} bot message "${message}" to ${name}`);
  }
}

module.exports = DiscordBot;
