var WebSocket = require('ws');
var ws;
var pusher;

var channels = {};

function Channel(channelName, options) {
  options = options || {};
  this.name = channelName;
  if(options.auth) {
    this.authenticated = true;
  }  
  
  if(channels[this.name]) {
    return channels[this.name];
  } else {  
    ws.send(JSON.stringify({
      event: "pusher:subscribe",
      data: {
        channel: channelName,
        auth: options.auth,
        channel_data: options.channel_data
      }
    }));
    
    channels[this.name] = this;
  }
}

Channel.prototype.bind = function(event, cb) {
  this.on(event, cb);
};

Channel.prototype.unsubscribe = function() {
  ws.send(JSON.stringify({
    event: "pusher:unsubscribe",
    data: {
      channel: this.name
    }
  }));
  
  delete channels[this.name];
};

Channel.prototype.trigger = function(event, data) {
  if(this.authenticated && (this.name.indexOf('private-') === 0 || this.name.indexOf('presence-') === 0)) {
    if(event.indexOf('client-') !== 0) {
      event = 'client-' + event;
    }
    ws.send(JSON.stringify({
      event: event,
      channel: this.name,
      data: data
    }));
  }
};

/**
 * Options
 *  cluster (optional)
 *  encrypted (optional) - NOT YET IMPLEMENTED
 */
function Pusher(key, options, cb) {
  pusher = this;
  options = options || {};
  this.key = key;
  this.cluster = options.cluster;
  this.encrypted = false;
  this.connected = false;
  this.socketId = undefined;
  
  var host = options.cluster ? 'ws-' + options.cluster + '.pusher.com' : 'ws.pusherapp.com';
  ws = new WebSocket(host, {
    path: '/app/' + this.key + '?protocol=7&client=espruino-websocket&version=3.2.1'
  });

  ws.on('message', function(msg) {
    var msg = JSON.parse(msg);
    var channel = msg.channel;
    var event = msg.event;
    var data = JSON.parse(msg.data);
    if(channel && channels[channel]) {
      channels[channel].emit(event, data);
    }
  });
  
  ws.on('open', function(msg) {
    var msg = JSON.parse(msg);
    var data = JSON.parse(msg.data);
    this.socketId = data.socket_id;
    pusher.connected = true;
    cb(pusher);
  });
}

/**
 * Subscribe to a channel
 * options - 
 *  auth (optional)
 *  channel_data (optional)
 */
Pusher.prototype.subscribe = function(channelName, options) {
  return new Channel(channelName, options);
};

/**
 * Unsubscribe from a channel
 */
Pusher.prototype.unsubscribe = function(channelName) {
  if(channels[channelName]) {
    channels[channelName].unsubscribe();
  }
};

/**
 * Bind to an event on all subscribed channels
 */
Pusher.prototype.bind = function(event, cb) {
  for(var channel in channel) {
    channel.bind(event, cb);
  }
};

/**
 * Disconnect from Pusher
 */
Pusher.prototype.disconnect = function() {
  ws.close();
  channels = {};
  this.connected = false;
  this.socketId = undefined;
};

exports = Pusher;
