var Controller = module.exports = function() {
  // this allows sub-class to hook into
  // initialize
  this.initialize.apply(this, arguments);
};

Controller.prototype.initialize = function(){};

Controller.prototype.create =
  Controller.prototype.read =
  Controller.prototype.update =
  Controller.prototype.destroy =
  Controller.prototype.index =
  function (req, res) {
    res.error('method ' + req.method+ ' not implemented!');
  };

Controller.prototype.handle = function(req, res) {
  console.info('handling req ' + req.controller + '/' + req.method);
  this[req.method](req, res);
};

Controller.extend = require('backbone').Model.extend;