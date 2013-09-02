/**
 * @fileoverview Utility functions for cards representation.
 * We represent cards by both string and number.
 *
 * By string each card is represented by exact 2 characters; suit and number.
 * Each suit Spade, Heart, Diamond and Club is represented by
 * 's', 'h', 'd' and 'c' respectively, and the number of cards is represented as
 * follows; for 2 to 9 they are represented by the character as it is,
 * say Duce is '2', for 10, Jack, Queen, King and Ace they are represented by
 * 'T', 'J', 'Q', 'K' and 'A' respectively. Then each card is represented by the
 * combination of the suit and number of the card like below.
 * Duce of Spade: 's2'
 * Queen of Club: 'cQ'
 * As for a pair of cards we just join each card of string.
 *
 * By number each card is represented by 1 to 52 since the number of cards is
 * 52. 1 represents Two of Spade, 2 is Two of Heart, 3 is Two of Diamond, 4 is
 * Two of Club, 5 is Three of Spade, and consequently 52 is Ace of Club.
 * In other words, reminder for the number divided by 4 represents the suite and
 * quotient does the number for cards. The reason why Two is the starting number
 * is Two is the weakest number for poker and thus for ease of development in
 * terms of comparison or sorting.
 * 0 exists for a special number that represents no card so that we can
 * represent multiple number of cards (i.e., if 0 is used for some card it is
 * hard to tell if some multiple number of cards contain that card with the
 * following representation).
 * As for a pair of cards we represent like the radix of 53, say the pair of
 * Two of Diamond and Ace of Spade becomes 3 * 53 + 49 = 208 (Two of Diamond
 * is 3 and Ace of Spade is 49).
 */

goog.provide('poker.cards');


/**
 * Card suits.
 * @enum {string}
 */
poker.cards.Suit = {
  SPADE: 's',
  HEART: 'h',
  DIAMOND: 'd',
  CLUB: 'c'
};


/**
 * Card number representations for 10 to A.
 * @const {Object.<string>}
 */
poker.cards.Numbers = {
  '10': 'T',
  '11': 'J',
  '12': 'Q',
  '13': 'K',
  '1': 'A'
};


/**
 * Returns cards as number from that as string.
 * @param {string} cardsStr Cards represented by string.
 * @return {number} Cards represented by number.
 */
poker.cards.fromString = function(cardsStr) {
  goog.asserts.assert(cardsStr.length % 2 == 0);
  var cardsNum = 0;
  for (var i = 0; i < cardsStr.length / 2; ++i) {
    cardsNum = cardsNum * 53 +
        poker.cards.fromStringSingle_(cardsStr.substr(2 * i, 2));
  }
  return cardsNum;
};


/**
 * Returns cards as string from that as number.
 * @param {number} cardsNum Cards represented by number.
 * @return {string} Cards represented by string.
 */
poker.cards.toString = function(cardsNum) {
  var strs = [];
  for (var cards = cardsNum; cards !=0; cards /= 53) {
    strs.push(poker.cards.toStringSingle_(cards % 53));
  }
  return strs.reverse().join('');
};


/**
 * Returns a single card as number from that as string.
 * @param {string} cardStr A card represented by string.
 * @return {number} A card represented by number.
 * @private
 */
poker.cards.fromStringSingle_ = function(cardStr) {
  var suit, number;
  // Gets suit.
  switch (cardStr[0]) {
    case poker.cards.Suit.SPADE: suit = 0; break;
    case poker.cards.Suit.HEART: suit = 1; break;
    case poker.cards.Suit.DIAMOND: suit = 2; break;
    case poker.cards.Suit.CLUB: suit = 3; break;
    default: goog.asserts.fail('Unknown suit: ' + cardStr[0]);
  }
  // Gets number.
  if (['2', '3', '4', '5', '6', '7', '8', '9'].contains(cardStr[1])) {
    number = parseInt(cardStr[1]) - 2;
  } else {
    switch (cardStr[1]) {
      case poker.cards.Numbers['10']: number = 8; break;
      case poker.cards.Numbers['11']: number = 9; break;
      case poker.cards.Numbers['12']: number = 10; break;
      case poker.cards.Numbers['13']: number = 11; break;
      case poker.cards.Numbers['1']: number = 12; break;
      default: goog.asserts.fail('Wrong number: ' + cardStr[1]);
    }
  }
  return suit + 4 * number + 1;
};


/**
 * Returns a single card as string from that as number.
 * @param {number} cardNum A card represented by number.
 * @return {string} A card represented by string.
 * @private
 */
poker.cards.toStringSingle_ = function(cardNum) {
  var suit, number;
  // Gets suit.
  switch ((cardNum - 1) % 4) {
    case 0: suit = poker.cards.Suit.SPADE; break;
    case 1: suit = poker.cards.Suit.HEART; break;
    case 2: suit = poker.cards.Suit.DIAMOND; break;
    case 3: suit = poker.cards.Suit.CLUB; break;
  }
  // Gets number.
  var numNum = (cardNum - 1) / 4 + 2;
  if (numNum == 14) {
    numNum = 1;
  }
  if (numNum >= 2 && numNum <= 9) {
    number = numNum.toString();
  } else {
    number = poker.cards.Numbers[numNum.toString()];
    goog.asserts.assert(number, 'Wrong number: ' + numNum.toString());
  }
  return suit + number;
};
