// in memory store plug-in
// taken from source: http://documentcloud.github.com/backbone/docs/backbone-localstorage.html

var _ = require('underscore');
var Backbone = require('backbone');

function S4() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

function guid() {
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

var data = {};

var Store = module.exports = function(name) {
  this.name = name;
  //var store = localStorage.getItem(this.name);
  //this.data = (store && JSON.parse(store)) || {};
};

_.extend(Store.prototype,
  {
    save: function() {
      //localStorage.setItem(this.name, JSON.stringify(this.data));
    },

    create: function(model) {
      if (!model.id) model.id = model.attributes.id = guid();
      data[model.id] = model;
      this.save();
      return model;
    },

    update: function(model) {
      //console.log('memstore update');
      data[model.id] = model;
      this.save();
      return model;
    },

    find: function(model) {
      //console.log('memstore find', model.id);
      return data[model.id];
    },

    findAll: function() {
      //console.log('find all');
      return _.values(data);
    },

    destroy: function(model) {
      delete data[model.id];
      this.save();
      return model;
    }
});

Backbone.sync = function(method, model, opts) {
  var resp;
  var store = model.localStorage || model.collection.localStorage;

  switch (method) {
    case "read":    resp = model.id ? store.find(model) : store.findAll(); break;
    case "create":  resp = store.create(model);                            break;
    case "update":
      // pass along the notication opts
      // trigger an instance change if available on model
      model.triggerInstanceChange && model.triggerInstanceChange(opts);
      resp = store.update(model);
    break;
    case "delete":  resp = store.destroy(model);                           break;
  }

  if (resp) {
    opts.success(resp);
  } else {
    console.log('record not found');
    opts.error("Record not found");
  }
};
