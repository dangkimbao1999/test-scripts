const Web3 = require('web3');

// Initialize Web3 with an Ethereum provider
const web3 = new Web3('https://rpc-nebulas-testnet.uniultra.xyz'); // Replace with your Ethereum provider URL

// Dummy type structures - replace these with the actual structures you need
const DATA_V1_TYPE = {
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
}


const DATA_V2_TYPE = {
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
}

const DATA_V3_BUY_TYPE = {
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
}

const DATA_V3_SELL_TYPE = {
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
}


const ZERO_WORD = '0x0000000000000000000000000000000000000000';

// Dummy implementation of encodePartToBuffer - replace with actual logic
export function encodePartToBuffer(part) {
	if (!part) {
		return toBigNumber(ZERO_WORD)
	}

	const value = part.value.toString(16)
	let account = part.account
	if (account.startsWith("0x")) {
		account = account.substring(2)
	}
	return toBigNumber("0x" + value.padStart(12, "0") + account)
}
function encodeRaribleV2OrderData(data, wrongEncode = false) {
    switch (data.dataType) {
        case "RARIBLE_V2_DATA_V3_BUY": {
            const encoded = web3.eth.abi.encodeParameter(DATA_V3_BUY_TYPE, {
                payouts: encodePartToBuffer(data.payout),
                originFeeFirst: encodePartToBuffer(data.originFeeFirst),
                originFeeSecond: encodePartToBuffer(data.originFeeSecond),
                marketplaceMarker: data.marketplaceMarker || ZERO_WORD,
            });
            return ["0x1b18cdf6", encoded];
        }
        case "RARIBLE_V2_DATA_V3_SELL": {
			const encoded = web3.eth.abi.encodeParameter(DATA_V3_SELL_TYPE, {
				payouts: encodePartToBuffer(data.payout),
				originFeeFirst: encodePartToBuffer(data.originFeeFirst),
				originFeeSecond: encodePartToBuffer(data.originFeeSecond),
				maxFeesBasePoint: data.maxFeesBasePoint,
				marketplaceMarker: data.marketplaceMarker || ZERO_WORD,
			})
			return ["0x2fa3cfd3", encoded]
		}
		case "RARIBLE_V2_DATA_V2": {
			const encoded = web3.eth.abi.encodeParameter(DATA_V2_TYPE, {
				payouts: data.payouts,
				originFees: data.originFees,
				isMakeFill: data.isMakeFill,
			})
			return ["0x23d235ef", encoded]
		}
		case "RARIBLE_V2_DATA_V1": {
			const encoded = web3.eth.abi.encodeParameter(DATA_V1_TYPE, {
				payouts: data.payouts,
				originFees: data.originFees,
			})
			if (wrongEncode) {
				return ["0x4c234266", `0x${encoded.substring(66)}`]
			}
			return ["0x4c234266", encoded]
		}
		default: {
			throw new Error(`Data type not supported: ${data.dataType}`)
		}
    }
}

module.exports = { encodeRaribleV2OrderData }