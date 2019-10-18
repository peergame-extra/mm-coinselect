var utils = require("./utils");

// add inputs until we reach or surpass the target value (or deplete)
// worst-case: O(n)
module.exports = function accumulative(utxos, outputs, feeRate) {
    if (!isFinite(utils.uintOrNaN(feeRate))) return {};
    var bytesAccum = utils.transactionBytes([], outputs);

    var inAccum = 0;
    var inputs = [];
    var outAccum = utils.sumOrNaN(outputs);

    for (var i = 0; i < utxos.length; ++i) {
        var utxo = utxos[i];
        var utxoBytes = utils.inputBytes(utxo);
        var utxoFee = utils.feeAmount(utxoBytes, feeRate);
        var utxoValue = utils.uintOrNaN(utxo.value);

        // skip detrimental input
        if (utxoFee > utxo.value) {
            if (i === utxos.length - 1) return { fee: utils.feeAmount(bytesAccum + utxoBytes, feeRate) };
            continue;
        }

        bytesAccum += utxoBytes;
        inAccum += utxoValue;
        inputs.push(utxo);

        var fee = utils.feeAmount(bytesAccum, feeRate);

        // go again?
        if (inAccum < outAccum + fee) continue;

        return utils.finalize(inputs, outputs, feeRate);
    }

    return { fee: utils.feeAmount(bytesAccum, feeRate) };
};
