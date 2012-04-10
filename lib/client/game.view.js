var Backbone = require('backbone'),
     _ = require('underscore');

var $ = window.jQuery;

var CellView = Backbone.View.extend({
  events: {
    "click .boardCell":"cellClicked"
  },

  tagName: 'td',
  initialize: function(){
    _.bindAll(this, 'render', "cellClicked");

    this.model.on('change', function(){
      var cellIdRef = '#cell' + this.get('row') + this.get('col');
      // reflect the cellValue change in view on change
      $(cellIdRef).text(this.get('cellValue'));
    });
  },
  render: function(){
    $(this.el).html('<div class="boardCell" id=cell'+ this.model.get('row') + this.model.get('col')+'></div>');
    return this; // for chainable calls, like .render().el
  },

  cellClicked:function(){
    this.trigger('click', {row:this.model.get('row'),
                          col:this.model.get('col'),
                          symbol:this.model.get('symbol')});
  }
});

exports.CellView = CellView;

var BoardView = Backbone.View.extend({
  initialize: function(){
    _.bindAll(this, 'render', 'appendItem');
    this.render();
    var self = this;

  },

  render: function(){
    for(var row=0; row < this.model.dimension; row++){
      var rowElem = $('<tr></tr>').appendTo($(this.el));
      for(var col=0; col < this.model.dimension; col++){
        this.appendItem(rowElem,this.model.getCell(row,col));
      }
    }
  },

  appendItem: function(rowElem, cell){
    var cellView = new CellView({
      model: cell
    });
    rowElem.append(cellView.render().el);
    // bind for cell clicks
    var self = this;
    cellView.on('click', function(cellInfo){
      // route cell clicks through board click event
      self.trigger('click', cellInfo);
    });
  }
});


exports.BoardView = BoardView;

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
      self.model.move(self.model.get('activePlayer'), clickInfo.row, clickInfo.col);
    });

    // track game state changes
    // the game model defines an 'update'
    // event that tracks the next game state
    this.model.on('update', function(){
      self.showGameState();
    });
  },

  render: function() {
    var gameDict = {player1: this.model.get('player1').get('name'),
                    player2: this.model.get('player2').get('name')};
    var html = this.template(gameDict);
    $(this.el).append(html);

    // set the initial active player
    this.showActivePlayer();
  },

  showActivePlayer: function(){
    if (this.model.get('activePlayer') == this.model.get('player1')){
      $('#player1').addClass("activePlayer");
      $('#player2').removeClass('activePlayer');
    } else {
      $('#player2').addClass("activePlayer");
      $('#player1').removeClass('activePlayer');
    }
  },

  showGameState: function(){
    this.showActivePlayer();
    // if there is a winner, show
    if (this.model.get('winner')){
      $('#winner').text(this.model.get('winner').get('name'));
    }
  }
});

exports.GameView = GameView;