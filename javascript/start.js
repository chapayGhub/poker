goog.provide('poker.start');

goog.require('goog.dom');

poker.start = function() {
  var newDiv = goog.dom.createDom('h1', {'style': 'background-color:#EEE'},
      'Hello world!');
  goog.dom.appendChild(document.body, newDiv);
};

// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('poker.start', poker.start);
