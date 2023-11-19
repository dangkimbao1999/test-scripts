const ethers = require('ethers');
const ethUtil = require('ethereumjs-util');
const {
    Order, 
    Asset, 
    id,
    enc,
  } = require('./utils');
/**
 * Signs an object using an Ethereum private key.
 * 
 * @param {Object} data - The data to be signed.
 * @param {string} privateKey - The private key to sign with.
 * @returns {string} The signature.
 */
function signData(data, privateKey) {
    // Convert the object to a JSON string and then to a Buffer
    const dataBuffer = Buffer.from(JSON.stringify(data));

    // Hash the data
    const dataHash = ethUtil.keccak256(dataBuffer);

    // Create a Wallet instance from the private key
    const wallet = new ethers.Wallet(privateKey);

    // Sign the hash of the data
    return wallet.signMessage(ethUtil.bufferToHex(dataHash));
}

// Example usage
const dataToSign = { message: "Hello, blockchain!" };
const privateKey = "0x2e0b716a5a37a69980849144cde8c911d80f07cff3aea1398d65b9c6ff8e6a26"; // Replace with your private key

const makerRight = '0x2743eEC46576f76f47334569074242F3D9a90B44'; // Seller's address
    const makerLeft = '0xf24c359B22728Ce712b81ee018344B58CEb55d51'; // Buyer's address
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const ERC721 = id('ERC721'); // Convert ERC721 to bytes4
    const ORDER_DATA_V3_SELL = id('V2'); // Convert to bytes4
    // const MARKET_MARKER_SELL  =ethUtil.bufferToHex(ethUtil.keccak256(Buffer.from('SELL')));; // Example market marker
    // console.log(MARKET_MARKER_SELL)
    const erc721TokenId1 = "17760227758553105267514834173274363141445655564409043896527491908769939456000"; // Example token ID
  
    const _priceSell = "50000000000000000";
    const _pricePurchase = "50000000000000000";
    const salt = 1;
    const nftAmount = 1;
    
    // const erc721 = await prepareERC721(makerLeft, erc721TokenId1, [[accounts[7], 100]]); //with royalties
    const _nftSellAssetData = enc("0x73039bafa89e6f17f9a6b0b953a01af5ecabacd2", erc721TokenId1);
    const _nftPurchaseAssetData = "0x";
    const ETH = id("ETH")
    const left = Order(makerLeft, Asset(ERC721, _nftSellAssetData, nftAmount), makerRight, Asset(ETH, _nftPurchaseAssetData, _priceSell), salt, 0, 1702856612, ORDER_DATA_V3_SELL, "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000f22f838aaca272afb0f268e4f4e655fac3a35ec00000000000000000000000000000000000000000000000000000000000002ee");

signData(left, privateKey).then(signature => {
    console.log("Signature:", signature);
}).catch(err => {
    console.error("Error:", err);
});
