var _ = require('underscore'),
    models = require('../common/game.model');

var playerIdCounter = 1;

// in memory store of active players
var activePlayersById = {};


var Player = module.exports = models.Player.extend({
  // the semantic of save is to update
  // the object with attrs that are set
  // in the attrs hash then commit the full
  // representation
  save: function(attrs, opts) {
    console.log('call save on server Player');
    // deal with attrs hash
    var silentOptions = _.extend({}, opts, {silent: true});
    if (attrs && !this.set(attrs, opts.wait ? silentOptions : opts)) {
      return;
    }

    //if the id is not set it assumed to be a new object
    if (this.get('id') == null){
      this.set('id', playerIdCounter++);
      // get ready to save
      // any time a player is created ad the active store of players
      activePlayersById[this.get('id')] = this;
      opts.success(this);
    } else {
      // retrieve active player from the in memory store and update
      var activePlayer = activePlayersById[this.get('id')];
      if (activePlayer){
        // update the active player
        activePlayer.set(this);
        opts.success(activePlayer);
      } else {
        opts.error('playerNotFound');
      }
      
    }
  },

  fetch: function(opts){
    console.log('fetching Player');
    var activePlayer = this.get('id') && activePlayersById[this.get('id')];
    if(activePlayer) {
      opts.success(activePlayer);
    } else {
      opts.error('playerNotFound');
    }
  }
});