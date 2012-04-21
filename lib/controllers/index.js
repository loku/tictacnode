var _ = require('underscore');

var controllers = {
  Games: new (require('./games')),
  Players: new (require('./players'))
};

// middleware: Any object references returned
//             to he websocket client to insure
//             that changes are broadcast to all
//             listeners


module.exports = function(socket) {
  // TODO timeout?
  socket.on('syncRequest', function(req) {
    var res = {
      success: function(res) {
        socket.emit('syncResponse-' + req.requestId, {success: res});  
      },
      error: function(err) {
        socket.emit('syncResponse-' + req.requestId, {error: err});
      }
    };
    req.socket = socket;
   
    controllers[req.controller].handle(req, res);
  });
};
