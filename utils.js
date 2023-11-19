const ethUtil = require('ethereumjs-util');
const { Web3 } = require('web3');
const EIP712 = require("./EIP712");
const web3 = new Web3(('https://rpc-nebulas-testnet.uniultra.xyz')); // or your Ethereum node URL

async function LibPartToUint(account = zeroAddress, value = 0) {
    return await encodeOriginFeeIntoUint(account, value);
}

function encDataV3_SELL(tuple) {
    return web3.eth.abi.encodeParameters([
        {
          'DataV3_SELL': {
            'payouts': 'uint',
            'originFeeFirst': 'uint',
            'originFeeSecond': 'uint',
            'maxFeesBasePoint': 'uint',
            'marketplaceMarker': 'bytes32',
          }
        }
      ], [tuple]);
  }

function encDataV3_BUY(tuple) {
    return web3.eth.abi.encodeParameters([
        {
          'DataV3_BUY': {
            'payouts': 'uint',
            'originFeeFirst': 'uint',
            'originFeeSecond': 'uint',
            'marketplaceMarker': 'bytes32',
          }
        }
      ], [tuple]);
  }

function enc(token, tokenId) {
	if (tokenId) {
		return web3.eth.abi.encodeParameters(["address", "uint256"], [token, tokenId]);
	} else {
		return web3.eth.abi.encodeParameter("address", token);
	}
}

function Order(maker, makeAsset, taker, takeAsset, salt, start, end, dataType, data) {
	return { maker, makeAsset, taker, takeAsset, salt, start, end, dataType, data };
}

async function getSignature(order, signer) {
    return sign(order, signer, "0xd8c5F75Aa01dC3db284F9F3C697C76C0D9DeB3A3");
}

// Equivalent to LibOrderDataV3.DataV3_SELL in Solidity
function createDataV3_SELL(payouts, originFeeFirst, originFeeSecond, maxFeesBasePoint, marketplaceMarker) {
    return {
        payouts,
        originFeeFirst,
        originFeeSecond,
        maxFeesBasePoint,
        marketplaceMarker
    };
}

// Equivalent to LibOrderDataV3.DataV3_BUY in Solidity
function createDataV3_BUY(payouts, originFeeFirst, originFeeSecond, marketplaceMarker) {
    return {
        payouts,
        originFeeFirst,
        originFeeSecond,
        marketplaceMarker
    };
}

function encodeOriginFeeIntoUint(account, value) {
    // Convert the account address to a BigInt
    // Remove the leading "0x" and parse as a hexadecimal number
    const accountBigInt = BigInt('0x' + account.slice(2));

    // Convert the uint96 value to BigInt
    const valueBigInt = BigInt(value);

    // Shift the value left by 160 bits and add the account value
    const encoded = (valueBigInt << BigInt(160)) + accountBigInt;

    return encoded.toString(10); // Convert the result to a string
}

function id(str) {
    const bufferStr = Buffer.from(str)
	return `0x${ethUtil.keccak256(bufferStr).toString("hex").substring(0, 8)}`;
}

function Asset(assetClass, assetData, value) {
	return { assetType: AssetType(assetClass, assetData), value };
}

function AssetType(assetClass, data) {
	return { assetClass, data }
}

async function sign(order, account, verifyingContract) {
    try {
        const chainId = Number(await web3.eth.getChainId());
        const data = EIP712.createTypeData({
            name: "Exchange",
            version: "2",
            chainId,
            verifyingContract
        }, 'Order', order, Types);
        console.log('loa')
        console.log(order)
        return (await EIP712.signTypedData(web3, account, data)).sig;
    } catch (err) {
        console.log(err)
    }
}

const Types = {
	AssetType: [
		{name: 'assetClass', type: 'bytes4'},
		{name: 'data', type: 'bytes'}
	],
	Asset: [
		{name: 'assetType', type: 'AssetType'},
		{name: 'value', type: 'uint256'}
	],
	Order: [
		{name: 'maker', type: 'address'},
		{name: 'makeAsset', type: 'Asset'},
		{name: 'taker', type: 'address'},
		{name: 'takeAsset', type: 'Asset'},
		{name: 'salt', type: 'uint256'},
		{name: 'start', type: 'uint256'},
		{name: 'end', type: 'uint256'},
		{name: 'dataType', type: 'bytes4'},
		{name: 'data', type: 'bytes'},
	]
};

module.exports = { Asset, LibPartToUint, id, createDataV3_SELL, createDataV3_BUY, getSignature, Order, enc, encDataV3_BUY, encDataV3_SELL}