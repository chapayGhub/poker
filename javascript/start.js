goog.provide('poker.start');

goog.require('poker.cards');

poker.start = function() {
  console.log(poker.cards.toString(poker.cards.fromString('sAcAdAsKhK')));
  console.log(poker.cards.evalHand('sAsKsQsTsJcAdA')); // => 1
};

// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('poker.start', poker.start);
