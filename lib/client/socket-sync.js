var Backbone = require('backbone'),
    _ = require('underscore'),
    counter = 0,
    socket = require('./socket');

// stolen from Backbone
// let you safely get the value of the property
// applying function for value, if function provided
function getValue (object, prop) {
  if (!(object && object[prop])) return null;
  return _.isFunction(object[prop]) ? object[prop]() : object[prop];
};

// add this flag so that we can distinguish between Model and
// Collection for the server
// when the socket sync happens, the server can know collection
// vs singleton
Backbone.Collection.prototype.isCollection = true;

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
      
      // when sync is called an implicit subscription
      // for server changes is established
      // set up automated subsciption from server
      // which will trigger 'change' event
      socket.on('changeMessage-' + res.success.id, function(attrs){
        //console.log('client recvd change message');
        // TODO: hanged model reference
        model.set(attrs);
      });

      options.success(res.success);
    }
  });

  
};
