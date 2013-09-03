goog.provide('poker.start');

goog.require('poker.cards');

poker.start = function() {
  console.log(poker.cards.toString(poker.cards.fromString('sAcAdAsKhK')));
  var a = +new Date();
  for (var i = 0; i < 1000000; ++i) {
    poker.cards.evalHand('sAc8s8sQsT');
  }
  console.log(+new Date() - a);
};

// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('poker.start', poker.start);
