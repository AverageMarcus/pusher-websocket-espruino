# pusher-websocket-espruino
A simple Pusher client for use on the Espruino

## :warning: Currently a work in progress :warning: 

Requires the websocket module from this Pull Request: https://github.com/espruino/EspruinoDocs/pull/281

### Known bugs:
 * Currently there is a problem when subscribing to multiple channels in sequence. This is due to a bug in the websocket module that I have yet been unable to fix.
 
## Example
 
```js
var PUSHER_KEY = '...';
new Pusher(PUSHER_KEY, {}, function(pusher) {
  var testChannel = pusher.subscribe('test_channel');

  testChannel.bind('my_event', function(data) {
    console.log('Got a message:', data);
  });
});
``` 

## API

### Constructor

`Pusher(appKey, options, callback)`

Returns: [Pusher](#pusher)

Options (with defaults):
```
{
  cluster: 'eu',     // (optional)
  encrypted: false   // (optional) - NOT YET IMPLEMENTED
}
```

Callback:
```
function(pusher) { ... }
```

### Pusher

#### subscribe
```
pusher.subscribe(channelName, options);
```
Returns: [Channel](#channel)

#### unsubscribe
```
pusher.unsubscribe(channelName);
```

#### bind
```
pusher.bind(EVENT, callback);
```

#### disconnect
```
pusher.disconnect();
```

### Channel

### bind
```
channel.bind(eventName, callback);
```

### trigger
```
channel.trigger(eventName, data);
```

### unsubscribe
```
channel.unsubscribe();
```
