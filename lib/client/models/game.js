var _ = require('underscore'),
    Backbone = require('backbone'),
    Board = require('./board'),
    CommonGame = require('../common/game');

// extend for client'ness
var Game = module.exports = CommonGame.extend({

  initialize:function(attrs) {
    // super
    CommonGame.prototype.initialize.apply(this, arguments);
    this.gameClientId = Math.round(Math.random() * 100000);

    console.log('oPlayer', this.get('oPlayerId'));

    // nest models as POJSOs
    this.board = new Board();
    this.moves = []

    // when the game is created, the only player
    // I know about it me
    this.me = attrs.me;

    // xPlayer goes first
    this.set('activePlayerId', this.get('xPlayerId'));

    //any time the next move changes, update the game
    var self = this;
    
    this.on('change:nextMove', function() {
      // every game instance updates itself
      // attenuate self notifications
      if (this.get('nextMove').gameClientId == this.gameClientId){
        // broadcast this game's lastMove change
        console.log('calling save');
        self.save();
      }
        
      // propogate changes in this game
      self.updateGame();
    });

  },

  isValidNextMove: function(nextMove) {
    // need to players to move
    // handles the case when tries to
    // move before the game is joined
    if (!this.get('xPlayerId') || !this.get('oPlayerId')) {
      console.error('two players not present');
      return false;
    }
    // if there is a winner, game is over
    if (this.get('winnerId')) {
      return false;
    }

    // insure players always take their turn
    if (nextMove.playerId != this.get('activePlayerId')){
      console.error('out of turn next - move player:', nextMove.playerId, ' active player: ', this.get('activePlayerId'));
      return false;
    }

    if (!this.board.isCellAvailable()){
      console.info('no available cell');
      return false;
    }

    return true;
  },

  // imperative wrapper for set('nextMove',move)
  move:function(row, col, playerId){
    var nextMove = {gameClientId: this.gameClientId,
                    playerId: playerId,
                    row: row, col: col};
 
    // nextMoves come from UI or server
    this.set('nextMove', nextMove);
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
    // play the next move
    var nextMove = this.get('nextMove');
    if (!this.isValidNextMove(nextMove)){
      return false;
    }

    // keep our move log
    this.moves.push(nextMove);

    var symbol = '';
    if (nextMove.playerId == this.get('xPlayerId')) {
      symbol = 'X';
    } else {
      symbol = 'O';
    }

    // <a href="http://www.dailymotion.com/video/x7mp5j_the-big-lebowski-world-of-pain_fun">Mark it O Smokey!!</a> (or X)

    console.log('updateGame - last move', nextMove.row, nextMove.col ,symbol);

    this.board.setCell(nextMove.row, nextMove.col, symbol);


    // when winning move activePlayer
    this.set('winnerId', this.isWinningMove() && this.get('activePlayerId'));

    // if no winner, toggle the player for next turn
    if (!this.get('winnerId')) {
      // toggle the active player
      this.set('activePlayerId',
               (nextMove.playerId == this.get('xPlayerId')) ?
                 this.get('oPlayerId') :
                 this.get('xPlayerId'));
    }


    // signal that the game state has
    // been updated, this is a custom event as
    // it distinguishes from 'change' events that
    // would be triggered off model changes like active
    // state change
    this.trigger('gameUpdate');
  },

  dumpGame: function() {
    console.info('game state change');
    this.board.dumpBoard();
    console.info('active player', this.get('activePlayerId'));
    if (this.get('winnerId')) {
      console.log('winner', this.get('winnerId'));
    } else {
      console.log('no winner');
    }
  },

  toJSON: function() {
    // super
    var json = CommonGame.prototype.toJSON.apply(this, arguments);
    
    // special case: indicates issue with modeling
    // in intial unjoined game state, send else remove meId
    if (this.xPlayerId && this.oPlayerId){
      delete json.meId;
    }
    
    return json;
  },

  // overide parse function
  parse:function(attrs) {
    // super
    var parsed = CommonGame.prototype.parse.apply(this, arguments);

    console.log('xplayerid', attrs);
    // inflate client references to players
    var xPlayer = new Player({id:attrs.xPlayerId});

    // re-bind to server
    // players can re-sync in async
    xPlayer.fetch(null, {success: function(attrs){
        if (this.xPlayer){
          this.xPlayer.set(attrs);
        } else {
          this.xPlayer = xPlayer;
        }
    }});

    var oPlayer = new Player({id:attrs.oPlayerId});
 
    oPlayer.fetch(null, {
      success:function(attrs){
        if (this.oPlayer) {
          this.oPlayer.set(attrs);
        } else {
          this.oPlayer = oPlayer;
        }
      }
    });
    if (attrs.winnerId){
      var winner = new Player({id:attrs.winnerId});
      winner.fetch(null, {success:function(attrs){
                      if (this.winner) {
                        this.winner.set(attrs);
                      } else {
                        this.winner = winner;
                      }
                  }});
    } else {
      this.winner = new Player({});
    }
    
     
    return parsed;
  }
});