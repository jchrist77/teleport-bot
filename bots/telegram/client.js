const Telegraf = require('telegraf');
const bus = require('../../bus');
const config = require('../../config').telegram;

/*
type Details = {
  name: string,
  message: string
};

type Context = {
  telegram: Telegraf$Telegram,
  updateType: string,
  updateSubTypes?: string,
  me?: string,
  message?: Telegram$Message,
  editedMessage?: Telegram$Message,
  // inlineQuery?: ,
  // chosenInlineResult?: ,
  // callbackQuery?: ,
  // shippingQuery?: ,
  // preCheckoutQuery?: ,
  // channelPost?: ,
  // editedChannelPost?: ,
  chat?: Telegram$Chat,
  from?: Telegram$User,
  match?: Array<?string>
};
*/

//const chat = config[process.env.NODE_ENV === 'prod' ? 'prod' : 'dev'];

const options = {};
const client = new Telegraf(config.token, options);

class Name {
  static from(author) {
    if (author.username) {
      return author.username;
    }
    if (author.title) {
      return author.title;
    }
    const names = [author.first_name, author.last_name].filter(x => x);
    if (names.length > 0) {
      return names.join(' ');
    }
    return `[Chat ${author.id}]`;
  }
}

class Message {
  constructor(msg) {
    this.msg = msg;
  }

  toString() {
    return this.msg.text || '';
  }
}

class StickerMessage extends Message {
  static test(msg) {
    return Boolean(msg.sticker);
  }

  toString() {
    const { msg } = this;
    let text = msg.text || '';
    const { sticker } = msg;
    if (!sticker) {
      return text;
    }
    const { emoji } = sticker;
    text += emoji ? `[Sticker ${emoji}]` : '';
    return text;
  }
}

class PhotoMessage extends Message {
  static test(msg) {
    return Boolean(msg.photo);
  }

  toString() {
    const caption = this.msg.caption || '';
    const text = `[Photo] ${caption}`;
    return text;
  }
}

class DocumentMessage extends Message {
  static test(msg) {
    return Boolean(msg.document);
  }

  toString() {
    const caption = this.msg.caption || '';
    const text = `[Document] ${caption}`;
    return text;
  }
}

class ReplyToMessage extends Message {
  static test(msg) {
    return Boolean(msg.reply_to_message);
  }

  getDetails() {
    const { msg } = this;
    const replyToMessage = msg.reply_to_message;
    if (!replyToMessage) {
      throw new Error('No reply_to_message');
    }
    const name = Name.from(replyToMessage.from);
    const message = prepareMessage(replyToMessage);
    return { name, message };
  }

  toString() {
    const { msg } = this;
    let { name, message } = this.getDetails();
    message = message.replace(/\n/g, '\n>> '); // adds quoting brackets
    return `>> <${name}> ${message}\n${msg.text || ''}`;
  }
}

class BotMessage extends ReplyToMessage {
  static test(msg) {
    const replyToMessage = msg.reply_to_message;
    if (!replyToMessage) {
      return false;
    }
    const isReplyWithText = Boolean(replyToMessage.text);
    const isReplyFromOurBot = BOT_TOKEN.indexOf(replyToMessage.from.id.toString()) > -1;
    return isReplyWithText && isReplyFromOurBot;
  }

  getDetails() {
    const { msg } = this;
    const replyToMessage = msg.reply_to_message;
    const text = (replyToMessage && replyToMessage.text) || '';
    const lineEndPos = text.indexOf('\n');
    const name = text.slice(0, lineEndPos);
    const message = text.slice(lineEndPos + 1);
    return { name, message };
  }
}

function messageFactory(msg) {
  if (StickerMessage.test(msg)) {
    return new StickerMessage(msg);
  }

  if (PhotoMessage.test(msg)) {
    return new PhotoMessage(msg);
  }

  if (DocumentMessage.test(msg)) {
    return new DocumentMessage(msg);
  }

  if (BotMessage.test(msg)) {
    return new BotMessage(msg);
  }

  if (ReplyToMessage.test(msg)) {
    return new ReplyToMessage(msg);
  }

  return new Message(msg);
}

function prepareMessage(msg) {
  const message = messageFactory(msg);
  let text = message.toString();
  const forwardFrom = msg.forward_from || msg.forward_from_chat;
  if (forwardFrom) {
    const name = Name.from(forwardFrom);
    text = text.replace(/\n/g, '\n>> '); // adds quoting brackets
    return `>> <${name}> ${text}`;
  }
  return text;
}

function prepareEmittingMessageDetails(message) {
  const chat = message.chat;
  if (chat.id !== config.chat.id) {
    return null;
  }
  const title = chat.title || '';
  const name = Name.from(message.from);
  const text = prepareMessage(message);
  return { platform: 'TELEGRAM', chat: title || chat.id, name, message: text };
}

function onMessage(ctx, next) {
  if (!ctx.message) {
    return;
  }
  const e = prepareEmittingMessageDetails(ctx.message);
  if (e) {
    bus.emitMessage(e);
    next();
  }
}

const updateTypes = ['text', 'sticker', 'photo', 'document'];

client.on(updateTypes, onMessage).startPolling();

module.exports = client;
