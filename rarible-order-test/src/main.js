"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRaribleV2OrderData = exports.encodePartToBuffer = void 0;
var types_1 = require("@rarible/types");
var web3_1 = require("web3");
var ZERO_WORD = (0, types_1.toWord)("0x0000000000000000000000000000000000000000000000000000000000000000");
var web3 = new web3_1.default('https://rpc-nebulas-testnet.uniultra.xyz/');
/**
 * Function encoded Part struct to single uint256
 * @param part
 */
function encodePartToBuffer(part) {
    if (!part) {
        return (0, types_1.toBigNumberLike)(ZERO_WORD);
    }
    var value = part.value.toString(16);
    var account = part.account;
    if (account.startsWith("0x")) {
        account = account.substring(2);
    }
    return (0, types_1.toBigNumberLike)("0x" + value.padStart(12, "0") + account);
}
exports.encodePartToBuffer = encodePartToBuffer;
function encodeRaribleV2OrderData(data, wrongEncode) {
    if (wrongEncode === void 0) { wrongEncode = false; }
    switch (data.dataType) {
        case "RARIBLE_V2_DATA_V3_BUY": {
            var encoded = web3.eth.abi.encodeParameter(DATA_V3_BUY_TYPE, {
                payouts: encodePartToBuffer(data.payout),
                originFeeFirst: encodePartToBuffer(data.originFeeFirst),
                originFeeSecond: encodePartToBuffer(data.originFeeSecond),
                marketplaceMarker: data.marketplaceMarker || ZERO_WORD,
            });
            return ["0x1b18cdf6", encoded];
        }
        case "RARIBLE_V2_DATA_V3_SELL": {
            var encoded = web3.eth.abi.encodeParameter(DATA_V3_SELL_TYPE, {
                payouts: encodePartToBuffer(data.payout),
                originFeeFirst: encodePartToBuffer(data.originFeeFirst),
                originFeeSecond: encodePartToBuffer(data.originFeeSecond),
                maxFeesBasePoint: data.maxFeesBasePoint,
                marketplaceMarker: data.marketplaceMarker || ZERO_WORD,
            });
            return ["0x2fa3cfd3", encoded];
        }
        case "RARIBLE_V2_DATA_V2": {
            var encoded = web3.eth.abi.encodeParameter(DATA_V2_TYPE, {
                payouts: data.payouts,
                originFees: data.originFees,
                isMakeFill: data.isMakeFill,
            });
            return ["0x23d235ef", encoded];
        }
        case "RARIBLE_V2_DATA_V1": {
            var encoded = web3.eth.abi.encodeParameter(DATA_V1_TYPE, {
                payouts: data.payouts,
                originFees: data.originFees,
            });
            if (wrongEncode) {
                return ["0x4c234266", "0x".concat(encoded.substring(66))];
            }
            return ["0x4c234266", encoded];
        }
        default: {
            throw new Error("Data type not supported: ".concat(data.dataType));
        }
    }
}
exports.encodeRaribleV2OrderData = encodeRaribleV2OrderData;
var DATA_V1_TYPE = {
    components: [
        {
            components: [
                {
                    name: "account",
                    type: "address",
                },
                {
                    name: "value",
                    type: "uint96",
                },
            ],
            name: "payouts",
            type: "tuple[]",
        },
        {
            components: [
                {
                    name: "account",
                    type: "address",
                },
                {
                    name: "value",
                    type: "uint96",
                },
            ],
            name: "originFees",
            type: "tuple[]",
        },
    ],
    name: "data",
    type: "tuple",
};
var DATA_V2_TYPE = {
    components: [
        {
            components: [
                {
                    name: "account",
                    type: "address",
                },
                {
                    name: "value",
                    type: "uint96",
                },
            ],
            name: "payouts",
            type: "tuple[]",
        },
        {
            components: [
                {
                    name: "account",
                    type: "address",
                },
                {
                    name: "value",
                    type: "uint96",
                },
            ],
            name: "originFees",
            type: "tuple[]",
        },
        {
            name: "isMakeFill",
            type: "bool",
        },
    ],
    name: "data",
    type: "tuple",
};
var DATA_V3_BUY_TYPE = {
    components: [
        {
            name: "payouts",
            type: "uint256",
        },
        {
            name: "originFeeFirst",
            type: "uint256",
        },
        {
            name: "originFeeSecond",
            type: "uint256",
        },
        {
            name: "marketplaceMarker",
            type: "bytes32",
        },
    ],
    name: "data",
    type: "tuple",
};
var DATA_V3_SELL_TYPE = {
    components: [
        {
            name: "payouts",
            type: "uint256",
        },
        {
            name: "originFeeFirst",
            type: "uint256",
        },
        {
            name: "originFeeSecond",
            type: "uint256",
        },
        {
            name: "maxFeesBasePoint",
            type: "uint256",
        },
        {
            name: "marketplaceMarker",
            type: "bytes32",
        },
    ],
    name: "data",
    type: "tuple",
};
