var Backbone = require('backbone'),
    _ = require('underscore');

// players will have at least a name by default
// use default attributes for required or instrinsic
// object propertiess
var Player = exports.Player = Backbone.Model.extend({
  defaults:{
    name:null
  },
  controller:'Players'
});

// A Board is comprised of an n X n array of cells
// that can contain a symbol
var Board = exports.Board = Backbone.Model.extend({
  // Boards have a specified n X n dimension, default is 3
  initialize:function(dimension) {
    dimension = dimension || 3;
    this.dimension = dimension  ;
    this.cells = [];
    for(var i = 0; i < dimension*dimension; i++){
      this.cells[i] = null;
    }
  },

  //debug method
  dumpBoard: function(){
    for(var row = 0; row < this.dimension; row++){
      var rowString = '';
      for (var col = 0; col < this.dimension; col++){
        var curCell = this.getCell(row,col);
        if (curCell){
          rowString += curCell
        } else {
          rowString += '_';
        }
      }
      console.info(rowString);
    }
  },

  // provide 2d indexing into collection
  getCell:function(row, col){
    var index = (row * this.dimension) + col;
    if (index >= this.cells.length) {
      console.error('index out of range getCell');
      throw 'indexOutOfRange';
    }
    return this.cells[index];
  },

  // wrapper function to set cell values on Board
  setCell: function(row, col, symbol){
    var index = (row * this.dimension) + col;
    if (index >= this.cells.length) {
      console.error('index out of range getCell');
      throw 'indexOutOfRange';
    }
    this.cells[index] = symbol;
    // trigger change event
    this.trigger('change', {row: row, col: col});
  },

  // helper to check for open spots
  isCellAvailable: function(){
   for (var i in this.cells){
     if (this.cells[i] == undefined) {
       return true;
     }
   }
   return false;
  }

});

// Move captures a single player move with a specific
// game
var Move = exports.Move = Backbone.Model.extend({
});

var Moves = Backbone.Collection.extend({
  model:Move
});


// Game consists of 2 *Player*(s) and 1 *Board*
exports.Game = Backbone.Model.extend({
  

  // define JSON serialization to handle nested
  // models
  toJSON: function(){
    return _.extend(Backbone.Model.prototype.toJSON.apply(this, arguments),
                    {
                      //board: this.board.toJSON(),
                      player1: this.player1 && this.player1.toJSON(),
                      player2: this.player2 && this.player2.toJSON(),
                      activePlayer: this.activePlayer && this.activePlayer.toJSON(),
                      winner: this.winner && this.winner.toJSON()
                    });
  },

  parse:function(){

  },

  dumpGame: function(){
    console.info('game state change');
    this.board.dumpBoard();
    console.info('active player', this.activePlayer.get('name'));
    if (this.winner) {
      console.log('winner', this.winner.get('name'));
    } else {
      console.log('no winner');
    }
  },

  initialize:function(model){
    // nest models as POJSOs
    this.board = new Board();
    this.moves = new Moves();
    this.activePlayer = model.player1;
    this.winner = null;


    this.player1 = model.player1;
    this.player2 = model.player2;
  },

  isValidMove: function(nextMove) {
    // if there is a winner, game is over
    if (this.winner) {
      return false;
    }

    // insure players always take their turn
    if (nextMove.get('player') != this.activePlayer){
      console.error('out of turn');
      return false;
    }

    if (!this.board.isCellAvailable()){
      console.info('no available cell');
      return false;
    }
    
    return true;
  },


  move:function(player, row, col){
    var nextMove = new Move({gameId: this.cid, 
                             player: this.activePlayer,
                             row: row, col: col})
    if (!this.isValidMove(nextMove)){
      console.log('invalid move');  
      return false;
    }
    
    this.moves.add(nextMove);
    this.updateGame();

    return true;
  },

  isWinningMove:function(){
    // search for win by rows
    var symbol = null;
    for (var row = 0; row < (this.board.dimension-1); row++){
      symbol = this.board.getCell(row,0);
      var col = 1;
      while(symbol && (symbol == this.board.getCell(row, col)) &&
            (col < this.board.dimension)) {
        if (col == (this.board.dimension-1)) {
          // got a winner by row win
          return true;
        }
        col++
      }
    }

    // search for win by columns
    for (col = 0; col < (this.board.dimension-1); col++){
      symbol = this.board.getCell(0,col);
      row = 1;
      while(symbol && (symbol == this.board.getCell(row, col)) &&
            (row < this.board.dimension)) {
        if (row == (this.board.dimension-1)) {
          // got a winner by row win
          return true;
        }
        row++
      }
    }

    // search for win by diagnals 1eft to right
    // start at l/t
    symbol = this.board.getCell(0,0);
    var i = 1;
    while (symbol && (symbol == this.board.getCell(i,i))){
      if (i == (this.board.dimension-1)) {
        // got a winner by diagnal win
        return true;
      }
      i++;
    }
    // right to left, start at r/t
    symbol = this.board.getCell(2,2);
    i = 1;
    while (symbol && (symbol == this.board.getCell(i,i))){
      if (i == (this.board.dimension-1)) {
        // got a winner by diagnal win
        return true;
      }
      i--;
    }
    return false;
  },

  updateGame: function(){
    // play the last move
    var lastMove = this.moves.at(this.moves.length-1);

    // *player1* is *X*, *player2* is *O*
    var symbol = '';
    if (lastMove.get('player') == this.get('player1')) {
      symbol = 'X';
    } else {
      symbol = 'O';
    }

    // <a href="http://www.dailymotion.com/video/x7mp5j_the-big-lebowski-world-of-pain_fun">Mark it O Smokey!!</a> (or X)
    
    console.log('last move', lastMove.get('row'), lastMove.get('col'),symbol);
    this.board.setCell(lastMove.get('row'), lastMove.get('col'), symbol);

    

    // check for winner
    this.winner = this.isWinningMove() && this.activePlayer;

    // if no winner, toggle the player for next turn
    if (!this.winner) {
      // toggle the active player
      this.activePlayer = (lastMove.get('player') == this.get('player1')) ?
                            this.get('player2') :
                            this.get('player1');
    }


    // signal that the game state has
    // been updated, this is a custom event as
    // it distinguishes from 'change' events that
    // would be triggered off model changes like active
    // state change
    this.trigger('update');
  } 

});
