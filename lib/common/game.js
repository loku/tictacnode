var _ = require('underscore'),
    Backbone = require('backbone'),
    Player = require('./player');
    Game = require('./game');


// Move captures a single player move with a specific
// game
var Move = Backbone.Model.extend({
});

var Moves = Backbone.Collection.extend({
  model:Move
});


// Game consists of 2 *Player*(s) and 1 *Board*
var Game = module.exports = Backbone.Model.extend({
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
