const { ethers } = require("ethers");
const { id, enc, Order, Asset } = require("./utils");
const { contractAbi } = require("./exchangev2Abi");
const { bufferToHex, bufferToInt, setLengthLeft, toBuffer } = require("ethereumjs-util");
// Initialize provider (using Infura, Alchemy, or other Ethereum node service)
const provider = new ethers.JsonRpcProvider("https://rpc-nebulas-testnet.uniultra.xyz");

// Contract details
const contractAddress = "0xd8c5F75Aa01dC3db284F9F3C697C76C0D9DeB3A3";
const contractABI = contractAbi // Contract ABI array
const buyer = "0x2743eEC46576f76f47334569074242F3D9a90B44"
// Initialize contract
const contract = new ethers.Contract(contractAddress, contractABI, provider);
const erc721TokenId1 = "17760227758553105267514834173274363141445655564409043896527491908769939456000"; // Example token ID

// Seller's Ethereum account (must be filled with correct data)
const sellerAddress = "0xf24c359B22728Ce712b81ee018344B58CEb55d51";
const sellerPrivateKey = "0x2e0b716a5a37a69980849144cde8c911d80f07cff3aea1398d65b9c6ff8e6a26";
const buyPrivateKey = "a67e478b3157fe8f554e58621c12364ac47050d3c6cfb7efb1bc9d18d0d31e98"

const _nftSellAssetData = enc("0x73039bafa89e6f17f9a6b0b953a01af5ecabacd2", erc721TokenId1);
const _nftPurchaseAssetData = "0x";
const price = ethers.parseEther("1.0")
// Create the Purchase object
const purchase = {
    sellOrderMaker: sellerAddress,
    sellOrderNftAmount: 1, // Example amount
    nftAssetClass:   id('ERC721'), // Example asset class
    nftData: _nftSellAssetData, // NFT data, specific to your contract
    sellOrderPaymentAmount: price, // Example payment amount
    paymentToken: "0x0000000000000000000000000000000000000000", // Payment token address
    sellOrderSalt: 123456, // Example salt
    sellOrderStart: 0, // Current timestamp
    sellOrderEnd: Math.floor(Date.now() / 1000) + 86400, // +1 day from current timestamp
    sellOrderDataType: id('V2'), // Order data type
    sellOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000f22f838aaca272afb0f268e4f4e655fac3a35ec00000000000000000000000000000000000000000000000000000000000002ee", // Order data
    buyOrderPaymentAmount: price,
    buyOrderNftAmount: 1,
    buyOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000f22f838aaca272afb0f268e4f4e655fac3a35ec00000000000000000000000000000000000000000000000000000000000002ee"
    // Other fields as per your contract requirements
};
const ETH = id("ETH")
const ERC721 = id('ERC721'); // Convert ERC721 to bytes4

async function execute1() {
    // Sign the sell order (this should be the hash of your sell order)
    const left = Order(sellerAddress, Asset(ERC721, _nftSellAssetData, 1), buyer, Asset(ETH, _nftPurchaseAssetData, 1), 123456, 0, 1702856612, id('V2'), "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000f22f838aaca272afb0f268e4f4e655fac3a35ec0000000000000000000000000000000000000000000000000000000000000001");
    const wallet = new ethers.Wallet(sellerPrivateKey, provider);
    const wallet1 = new ethers.Wallet(buyPrivateKey, provider);
    const sellOrderHash = hashOrder(left); 
    console.log('order: ', left)
    const sellOrderSignature = await wallet.signMessage(sellOrderHash);
    console.log('alo')
    console.log('hash: ', sellOrderHash);
    console.log('signature: ', sellOrderSignature);
    purchase.sellOrderSignature = sellOrderSignature;
    console.log(sellOrderSignature)
    
    // Call directPurchase function
    const contractWithSigner = contract.connect(wallet1);
    const tx = await contractWithSigner.directPurchase(purchase);
    console.log("Transaction sent! Hash:", tx.hash);

}

const ORDER_TYPEHASH = ethers.id(
    "Order(address maker,Asset makeAsset,address taker,Asset takeAsset,uint256 salt,uint256 start,uint256 end,bytes4 dataType,bytes data)Asset(AssetType assetType,uint256 value)AssetType(bytes4 assetClass,bytes data)"
);

const ASSET_TYPE_TYPEHASH = ethers.id(
    "AssetType(bytes4 assetClass,bytes data)"
);

const ASSET_TYPEHASH = ethers.id(
    "Asset(AssetType assetType,uint256 value)AssetType(bytes4 assetClass,bytes data)"
);

// Replicates `hash(AssetType memory assetType)` from Solidity
function hashAssetType(assetType) {
    return ethers.solidityPackedKeccak256(
        ["bytes32", "bytes4", "bytes32"],
        [
            ASSET_TYPE_TYPEHASH,
            assetType.assetClass,
            ethers.keccak256(assetType.data)
        ]
    );
}

// Replicates `hash(Asset memory asset)` from Solidity
function hashAsset(asset) {
    return ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32", "uint256"],
        [
            ASSET_TYPEHASH,
            hashAssetType(asset.assetType),
            asset.value
        ]
    );
}

function hashOrder(order) {
    return ethers.solidityPackedKeccak256(
        ["bytes32", "address", "bytes32", "address", "bytes32", "uint256", "uint256", "uint256", "bytes4", "bytes32"],
        [
            ORDER_TYPEHASH,
            order.maker,
            hashAsset(order.makeAsset),
            order.taker,
            hashAsset(order.takeAsset),
            order.salt,
            order.start,
            order.end,
            order.dataType,
            ethers.keccak256(order.data) // Assuming order.data is already in bytes
        ]
    );
}

function fixSignature(sig) {
	if (sig !== undefined) {
		const buf = hexToBuffer(sig)
		if (buf.length === 65) {
			const v = bufferToInt(buf.slice(64))
			if (v < 27) {
				const r = buf.slice(0, 32)
				const s = buf.slice(32, 64)
				return toRpcSig(v + 27, r, s)
			} else {
				return sig
			}
		} else {
			return sig
		}
	} else {
		return sig
	}
}

function hexToBuffer(hex) {
	if (hex.startsWith("0x")) {
		return Buffer.from(hex.substring(2), "hex")
	} else {
		return Buffer.from(hex, "hex")
	}
}

execute1();

