const { EventEmitter } = require('events');

class Emitter extends EventEmitter {}

const bus = new Emitter();

bus.emitMessage = function(e) {
  bus.emit('message', e);
  //console.log('Message:', JSON.stringify(e));
};

module.exports = bus;
