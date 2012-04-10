var Backbone = require('backbone'),
    _ = require('underscore');

Player = Backbone.Model.extend({
  defaults:{
    name:null
  }
});

exports.Player = Player;

Cell = Backbone.Model.extend({
  defaults:{
    "cellValue" : null // default null == empty
  },
  initialize:function(){
    var self = this;
  }
});

exports.Cell;

Board = Backbone.Collection.extend({
  model:Cell,

  initialize:function(_, opts){
    this.dimension = opts ? opts['dimension'] || 3 : 3; // n X n dimension of board
    for (var i = 0; i < this.dimension; i++){
      for (var j = 0; j < this.dimension; j++){
        var newCell = new Cell({
          row:i,
          col:j
        });
        this.add(newCell);
      }
    }
  },

  dumpBoard: function(){
    for(var row = 0; row < this.dimension; row++){
      var rowString = '';
      for (var col = 0; col < this.dimension; col++){
        var curCell = this.board.getCellValue(row,col);
        if (curCell){
          rowString += curCell
        } else {
          rowString += '_';
        }
      }
      console.info(rowString);
    }
  },

  getCell:function(row, col){
    var cells = this.toArray();
    var index = (row * this.dimension) + col;

    if (index >= cells.length) {
      console.log('test');
      console.error('index out of range getCellValue');
      throw 'indexOutOfRange';
    }
    return cells[index];
  },

  getCellValue: function(row, col) {
    return this.getCell(row,col).get('cellValue');
  },

  setCellValue: function(row, col, symbol){
    this.getCell(row,col).set('cellValue', symbol);
  }

});

exports.Board = Board;


Game = Backbone.Model.extend({
  defaults:{
    player1:null,       // two men (or women) enter
    player2:null,
    activePlayer:null,  // player with current turn
    winner:null         // one man leaves, who runs Barter Town
  },

  dumpGameState: function(){
    console.info('game state change');
    var self = this;
    this.board.dumpBoard();
    if (self.get('winner')){
      console.log('winner', self.get('winner').get('name'));
    } else {
      console.log('no winner');
    }
  },

  initialize:function(){
    this.board = new Board();
    // any changes check for winning state
    var self = this;
    // board changes trigger re-evaluation of game
    this.board.on('change', function(){
      // update the game state, which cascades changes
      //  to views bound to game
      self.updateWinnersLosers();
      // signal that the game state has
      // been updated
      self.trigger('update');
    });

    // first active player, player1
    this.set('activePlayer', this.get('player1'));
  },

  move:function(player, row, col){
    // insure players always take their turn
    if (player != this.get('activePlayer')){
      console.error('out of turn');
      throw 'outofturn';
    }

    if (this.get('winner')) {
      // if there is a winner, game is over
      // nop move
      return;
    }

    // if there are no cells left to take
    if (!this.board.find(function(cell){
        return (cell.get('cellValue') == null);
        })) {
      return;
    }

    // player1 is X, player2 is O
    var symbol = '';
    if (player == this.get('player1')) {
      symbol = 'X';
    } else {
      symbol = 'O';
    }

    // mark it X Smokey! (or O)

    this.board.setCellValue(row, col, symbol);


    // toggle the active player
    this.set('activePlayer', (player == this.get('player1')) ?
      this.get('player2'): this.get('player1'));

    // signal that the game state has
    // been updated
    this.trigger('update');
  },

  updateWinnersLosers:function(){
    // check rows
    var symbol = null;
    for (var row = 0; row < (this.board.dimension-1); row++){
      symbol = this.board.getCellValue(row,0);
      var col = 1;
      while(symbol && (symbol == this.board.getCellValue(row, col)) &&
            (col < this.board.dimension)) {
        if (col == (this.board.dimension-1)) {
          // got a winner by row win
          this.set('winner', this.get('activePlayer'));
          return;
        }
        col++
      }
    }

    // check col
    for (col = 0; col < (this.board.dimension-1); col++){
      symbol = this.board.getCellValue(0,col);
      row = 1;
      while(symbol && (symbol == this.board.getCellValue(row, col)) &&
            (row < this.board.dimension)) {
        if (row == (this.board.dimension-1)) {
          // got a winner by row win
          this.set('winner', this.get('activePlayer'));
          return;
        }
        row++
      }
    }

    // check diagnal
    symbol = this.board.getCellValue(0,0);
    var i = 1;
    while (symbol && (symbol == this.board.getCellValue(i,i))){
      if (i == (this.board.dimension-1)) {
        // got a winner by diag win
        this.set('winner', this.get('activePlayer'));
        return;
      }
      i++;
    }
  }
});

exports.Game = Game;

