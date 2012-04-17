var Backbone = require('backbone'),
     _ = require('underscore');

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
      self.model.move(self.model.activePlayer, clickInfo.row, clickInfo.col);
    });

    // track game state changes
    // the game model defines an 'update'
    // event that tracks the next game state
    this.model.on('update', function(){
      self.showGameUpdate();
    });
  },

  render: function() {
    $(this.el).append(this.template(this.model.toJSON()));

    // set the initial active player
    this.showGameUpdate();
  },

  showActivePlayer: function(){
    if (this.model.activePlayer == this.model.player1){
      $('#player1').addClass("activePlayer");
      $('#player2').removeClass('activePlayer');
    } else {
      $('#player2').addClass("activePlayer");
      $('#player1').removeClass('activePlayer');
    }
  },
  // single function to update all game state
  showGameUpdate: function(){
    this.showActivePlayer();
    // if there is a winner, show
    if (this.model.winner){
      $('#winner').text(this.model.winner.get('name'));
    }
  }
});

exports.GameView = GameView;