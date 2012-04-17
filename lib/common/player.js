var _ = require('underscore'),
    Backbone = require('backbone');


// players will have at least a name by default
// use default attributes for required or instrinsic
// object propertiess
var Player = module.exports = Backbone.Model.extend({
  defaults:{
    name:null
  },
  controller:'Players'
});
