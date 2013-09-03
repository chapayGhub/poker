/**
 * @fileoverview Utility functions for cards representation.
 * We represent cards by both string and number.
 *
 * By string each card is represented by exact 2 characters; suit and rank.
 * Each suit Spade, Heart, Diamond and Club is represented by
 * 's', 'h', 'd' and 'c' respectively, and the rank of cards is represented as
 * follows; for 2 to 9 they are represented by the character as it is,
 * say Duce is '2', for 10, Jack, Queen, King and Ace they are represented by
 * 'T', 'J', 'Q', 'K' and 'A' respectively. Then each card is represented by the
 * combination of the suit and rank of the card like below.
 * Duce of Spade: 's2'
 * Queen of Club: 'cQ'
 * As for a pair of cards we just join each card of string.
 *
 * By number each card is represented by 1 to 52 since the number of cards is
 * 52. 1 represents Two of Spade, 2 is Two of Heart, 3 is Two of Diamond, 4 is
 * Two of Club, 5 is Three of Spade, and consequently 52 is Ace of Club.
 * In other words, reminder for the number divided by 4 represents the suit and
 * quotient does the rank for cards. The reason why Two is the starting rank
 * is Two is the weakest rank for poker and thus for ease of development in
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

goog.require('goog.asserts');
goog.require('poker.hashtables');


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
 * Card rank representations for 10 to A.
 * @const {Object.<string>}
 */
poker.cards.Ranks = {
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
  for (var cards = cardsNum; cards != 0; cards = Math.floor(cards / 53)) {
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
  var suit, rank;
  // Gets suit.
  switch (cardStr[0]) {
    case poker.cards.Suit.SPADE: suit = 0; break;
    case poker.cards.Suit.HEART: suit = 1; break;
    case poker.cards.Suit.DIAMOND: suit = 2; break;
    case poker.cards.Suit.CLUB: suit = 3; break;
    default: goog.asserts.fail('Unknown suit: ' + cardStr[0]);
  }
  // Gets rank.
  if (['2', '3', '4', '5', '6', '7', '8', '9'].indexOf(cardStr[1]) >= 0) {
    rank = parseInt(cardStr[1]) - 2;
  } else {
    switch (cardStr[1]) {
      case poker.cards.Ranks['10']: rank = 8; break;
      case poker.cards.Ranks['11']: rank = 9; break;
      case poker.cards.Ranks['12']: rank = 10; break;
      case poker.cards.Ranks['13']: rank = 11; break;
      case poker.cards.Ranks['1']: rank = 12; break;
      default: goog.asserts.fail('Wrong rank: ' + cardStr[1]);
    }
  }
  return suit + 4 * rank + 1;
};


/**
 * Returns a single card as string from that as number.
 * @param {number} cardNum A card represented by number.
 * @return {string} A card represented by string.
 * @private
 */
poker.cards.toStringSingle_ = function(cardNum) {
  var suit, rank;
  // Gets suit.
  switch ((cardNum - 1) % 4) {
    case 0: suit = poker.cards.Suit.SPADE; break;
    case 1: suit = poker.cards.Suit.HEART; break;
    case 2: suit = poker.cards.Suit.DIAMOND; break;
    case 3: suit = poker.cards.Suit.CLUB; break;
  }
  // Gets rank.
  var rankNum = Math.floor((cardNum - 1) / 4) + 2;
  if (rankNum == 14) {
    rankNum = 1;
  }
  if (rankNum >= 2 && rankNum <= 9) {
    rank = rankNum.toString();
  } else {
    rank = poker.cards.Ranks[rankNum.toString()];
    goog.asserts.assert(rank, 'Wrong rank: ' + rankNum.toString());
  }
  return suit + rank;
};


/**
 * Evaluates the given cards in terms of poker hand. The returned value ranges
 * from {@code 1} to {@code 7462} introduced by {@link
 * http://www.suffecool.net/poker/evaluator.html}. The smaller value represents
 * the stronger hand. We can evaluate 5 to 7 cards and choose the best hand
 * among all possible 5 cards as we normally do in texas hold'em.
 * @param {number|string} cardsNumOrStr Cards of number or string.
 * @param {(number|string)=} opt_otherCardsNumOrStr Additional cards of
 *     number or string. If this is given, all cards mixed with the first
 *     arguments are considered to evaluate. So you can use this like you pass
 *     a player's hand as the first argument and a flop as the second argument.
 * @return {number}
 */
poker.cards.evalHand = function(cardsNumOrStr, opt_otherCardsNumOrStr) {
  /**
   * Array of all cards of number.
   * @type {Array.<number>}
   */
  var allCards = [];
  for (var cardsNum = typeof cardsNumOrStr == 'number' ?
      cardsNumOrStr : poker.cards.fromString(cardsNumOrStr);
      cardsNum != 0; cardsNum = Math.floor(cardsNum / 53)) {
    allCards.push(cardsNum % 53);
  }
  if (opt_otherCardsNumOrStr) {
    for (cardsNum = typeof opt_otherCardsNumOrStr == 'number' ?
        opt_otherCardsNumOrStr : poker.cards.fromString(opt_otherCardsNumOrStr);
        cardsNum != 0; cardsNum = Math.floor(cardsNum / 53)) {
      allCards.push(cardsNum % 53);
    }
  }
  if (allCards.length == 5) {
    return poker.cards.eval5Cards_(allCards);
  } else if (allCards.length == 6) {
    var bestHand = 9999;
    for (var i = 0; i < 6; ++i) {
      /** @type {Array.<number>} */
      var cards = [];
      for (var j = 0; j < 6; ++j) {
        if (j != i) {
          cards.push(allCards[j]);
        }
      }
      var hand = poker.cards.eval5Cards_(cards);
      if (hand < bestHand) {
        bestHand = hand;
      }
    }
    return bestHand;
  } else if (allCards.length == 7) {
    bestHand = 9999;
    for (i = 0; i < 6; ++i) {
      for (j = i + 1; j < 7; ++j) {
        cards = [];
        for (var k = 0; k < 7; ++k) {
          if (k != i && k != j) {
            cards.push(allCards[k]);
          }
        }
        hand = poker.cards.eval5Cards_(cards);
        if (hand < bestHand) {
          bestHand = hand;
        }
      }
    }
    return bestHand;
  } else {
    goog.asserts.fail(
        'The number of cards should be 5 to 7: ' + allCards.length);
  }
};


/**
 * Evaluates 5 cards as poker hand. The returned value is the same value
 * described at {@code evalHand}.
 * @param {Array.<number>} cards Array of cards of number.
 * @return {number}
 * @private
 */
poker.cards.eval5Cards_ = function(cards) {
  var rankBits = 0;
  for (var i = 0; i < 5; ++i) {
    rankBits |= 1 << (cards[i] - 1) / 4;
  }
  var unique5 = poker.hashtables.UNIQUE5[rankBits];
  if (unique5) {
    // There is no pair so check if flush.
    var flush = true;
    for (var suitOfFirstCard = cards[0] % 4, i = 1; i < 5; ++i) {
      if (suitOfFirstCard != cards[i] % 4) {
        flush = false;
        break;
      }
    }
    if (flush) {
      if (unique5 < 1610) {
        // Straight flush.
        return unique5 - 1599;
      } else {
        // Flush.
        return unique5 - 5863;
      }
    } else {
      // Straight or high card.
      return unique5;
    }
  } else {
    // Pair. See {@link http://www.psenzee.com/code/fast_eval.c}.
    var product = 1;
    for (i = 0; i < 5; ++i) {
      product *= poker.hashtables.RANK_PRIMES[Math.floor((cards[i] - 1) / 4)];
    }
    product += 0xe91aaa35;
    product ^= product >>> 16;
    product += product << 8;
    product ^= product >>> 4;
    var a  = (product + (product << 2)) >>> 19;
    var b  = (product >>> 8) & 0x1ff;
    return poker.hashtables.PAIR[a ^ poker.hashtables.PAIR_ADJUST[b]];
  }
};
