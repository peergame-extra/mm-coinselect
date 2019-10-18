var accumulative = require("./accumulative");
var blackjack = require("./blackjack");
var utils = require("./utils");

function utxoAncestorCountScore(x) {
    return x.ancestorCount || 0;
}

// order by descending value, minus the inputs approximate fee
function utxoAmountScore(x, feeRate) {
    return x.value - utils.feeAmount(utils.inputBytes(x), feeRate);
}

module.exports = function coinSelect(utxos, outputs, feeRate) {
    utxos = utxos.concat().sort(function(a, b) {
        const ancestorScore = utxoAncestorCountScore(b) - utxoAncestorCountScore(a);
        if (ancestorScore == 0) return utxoAmountScore(b, feeRate) - utxoAmountScore(a, feeRate);
        else return ancestorScore;
    });

    // attempt to use the blackjack strategy first (no change output)
    var base = blackjack(utxos, outputs, feeRate);
    if (base.inputs) return base;

    // else, try the accumulative strategy
    return accumulative(utxos, outputs, feeRate);
};
