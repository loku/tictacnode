var Backbone = require('backbone'),
    _ = require('underscore'),
    socket = require('./socket');

// requestId counter to insure sync message are
// paired correctly
var counter = 0;

// stolen from Backbone
// let you safely get the value of the property
// applying function for value, if function provided
function getValue (object, prop) {
  if (!(object && object[prop])) return null;
  return _.isFunction(object[prop]) ? object[prop]() : object[prop];
};

// mockey patch this flag so that we can distinguish between Model and
// Collection for the server
// when the socket sync happens, the server can know collection
// vs singleton
Backbone.Collection.prototype.isCollection = true;

var modelRegistry = {};

Backbone.sync = function(method, model, options) {
  // TODO options.timeout?
  var params = getValue(model, 'params') || {},
      controller = getValue(model, 'controller'),
      requestId = counter++;

  var syncRequest = {
    requestId: requestId,
    controller: controller,
    method: method,
    model: model.toJSON(),
    params: _.extend(_.clone(params), options)
  };

  // replace collection read and index to disambiguate singleton and
  // collection
  if (model.isCollection) {
    // map 'read' on collection to 'index'
    syncRequest.method = 'index';
  } else if (syncRequest.method == 'delete') {
    // map 'delete' to 'destroy' since 'delete' is a keyword
    syncRequest.method = 'destroy';
  }

  socket.emit('syncRequest', syncRequest);

  // TODO: need to handle errors
  socket.once('syncResponse-'+ requestId, function (res) {
    if (res.error) {
      options.error(res.error);
    } else if (res.success) {
      // side-effect model attrs first to deal with initial id setting
      console.log('sycn response with update');
      options.success(res.success);

      // make sure we only hook callback once per model
      if (!modelRegistry[model.id]) {
        console.log('registering model:', model.id);
        modelRegistry[model.id] = true;
        // when sync is called an implicit subscription
        // for server changes is established
        // set up automated subsciption from server
        // which will trigger 'change' event
        socket.on('instanceChange', function(attrs){
          console.log('client recvd instanceChange message');
          // TODO: hanged model reference
          if (model.id == attrs['id']){
            console.log('instanceChanged', model.id)
            // change events will only fire
            // if changes are deteteced
            model.set(attrs);
          }
        });

      }
      
      

      
    }
  });

  
};
