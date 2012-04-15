var _=require('underscore'),
    Backbone = require('backbone');

// Extend realtime models with backbone events
module.exports = function(modelClass) {
  _.extend(modelClass, Backbone.Events);
}
