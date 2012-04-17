var _ = require('underscore'),
    Backbone = require('backbone');


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