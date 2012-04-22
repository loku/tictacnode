var Backbone = require('backbone'),
     _ = require('underscore'),
     Player = require('../common/player')
var $ = window.jQuery;


var BoardView = Backbone.View.extend({

  // track click events
  // attribute value is jQuery (<b>event</b>, <b>selector</b>) tuple
  events: {
    "click .boardCell":"cellClicked"
  },

  initialize: function(){
    var self = this;
    _.bindAll(this, 'render', 'cellClicked');
    
    // hange th board scafolding
    this.render();
    
    // reflect the cellValue change in view on Backbone <b>change</b> event
    this.model.on('change', function(boardChange){
      var cellIdRef = '#cell' + boardChange.row + boardChange.col;
      // reflect the current state
      $(cellIdRef).text(self.model.getCell(boardChange.row, boardChange.col));
    });
  },

  // <b>render</b> sets up the scafolding for the view
  // iterate over the the cells row, col wise
  // appending row new elements
  render: function(){
    for(var row=0; row < this.model.dimension; row++){
      var rowElem = $('<tr></tr>').appendTo($(this.el));
      for(var col=0; col < this.model.dimension; col++){
        var cellElem = $('<td></td>').appendTo(rowElem);
        $(cellElem).html('<div class="boardCell" id=cell'+ 
                          row + col +'></div>');
      }
    }
  },

  // map click event to Backbone Event
  // this abstracts the element implementation specifics
  // from clients of the cell
  cellClicked:function(ev){
    var cellId = ev.target.id;
    // TODO: update to handle mode than 9 cells
    var row = parseInt(cellId[4]);
    var col = parseInt(cellId[5]);
    this.trigger('click', {row:row,
                           col:col,
                           symbol:this.model.get('symbol')});
  }

});

exports.BoardView = BoardView;


// <b>GameView</b> is constructed as a composite of a <b>BoardView</b>
// and additional elements that show the current game states
var GameView = Backbone.View.extend({
  el:$('#game'),

  initialize:function(){
    this.template =_.template($("#game-template").html());
    this.render();
    // attach the element and model dynamically
    // the board element is not known until the game
    // element is rendered
    this.boardView = new BoardView({el:$('#board'), model:this.model.board});
    var self = this;
    this.boardView.on('click', function(clickInfo){
      self.model.move(clickInfo.row, clickInfo.col, self.model.get('meId'));
    });

    // track game state changes
    // the game model defines an 'update'
    // event that tracks the next game state
    this.model.on('gameUpdate', function(){
      self.showGameUpdate();
    });

    // add the player models based Game
    this.xPlayer = new Player({id:this.model.get('xPlayerId')});
    this.oPlayer = new Player({id:this.model.get('oPlayerId')});

    function setNameAndAvatar(playerRef, player){
      if (player.get('avatarImg')){
         $(self.el).find(playerRef + 'Avatar').append($('<img src="' + player.get('avatarImg') + '"></img>'));
      }

      $(self.el).find(playerRef).text(player.get('name'));
    }

    // players can change names
    this.xPlayer.on('change', function(updatedPlayer){
      setNameAndAvatar('#xPlayer', updatedPlayer);
    });

    this.oPlayer.on('change', function(updatedPlayer){
      setNameAndAvatar('#oPlayer', updatedPlayer);
    });

    // bind the the player models
    // updates will propogate through change notifications
    this.xPlayer.fetch();
    this.oPlayer.fetch();
    this.showActivePlayer();
  },

  render: function() {
    // set the initial active player
    this.showGameUpdate();
    $(this.el).append(this.template({}));
  },

  showActivePlayer: function(){
    if (this.model.get('activePlayerId') == this.model.get('xPlayerId')){
      $('#xPlayer').addClass("activePlayer");
      $('#oPlayer').removeClass('activePlayer');
    } else {
      $('#oPlayer').addClass("activePlayer");
      $('#xPlayer').removeClass('activePlayer');
    }
  },
  // single function to update all game state
  showGameUpdate: function(){
    this.showActivePlayer();
    // if there is a winner, show
    var winnerId = this.model.get('winnerId');
    if (winnerId){
      console.log('got winner');
      $('#winner').text(this.xPlayer.id == winnerId ?
                        this.xPlayer.get('name'):
                        this.oPlayer.get('name')
                       );
    }
  }
});

exports.GameView = GameView;