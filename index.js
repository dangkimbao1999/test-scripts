const Web3 = require('web3');
// const web3 = new Web3();
const ethUtil = require('ethereumjs-util');

// Assuming these functions are implemented elsewhere in your code
const {
  prepareERC721, 
  LibPartToUint, 
  encDataV3_SELL, 
  encDataV3_BUY, 
  Order, 
  Asset, 
  getSignature,
  id,
  enc,
} = require('./utils');

async function generateDirectPurchaseParams() {
    const makerRight = '0x2743eEC46576f76f47334569074242F3D9a90B44'; // Seller's address
    const makerLeft = '0xf24c359B22728Ce712b81ee018344B58CEb55d51'; // Buyer's address
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const ERC721 = id('ERC721'); // Convert ERC721 to bytes4
    const ORDER_DATA_V3_SELL = id('V2'); // Convert to bytes4
    // const MARKET_MARKER_SELL  ="`0x68619b8adb206de04f676007b2437f99ff6129b672495a6951499c6c56bc2f10`"; // Example market marker
    const MARKET_MARKER_SELL  =ethUtil.bufferToHex(ethUtil.keccak256(Buffer.from('SELL')));; // Example market marker
    console.log(MARKET_MARKER_SELL)
    const MARKET_MARKER_BUY = "0x68619b8adb206de04f676007b2437f99ff6129b672495a6951499c6c56bc2f11";// Example market marker
    const erc721TokenId1 = "17760227758553105267514834173274363141445655564409043896527491908769939456000"; // Example token ID
  
    const _priceSell = "50000000000000000";
    const _pricePurchase = "50000000000000000";
    const salt = 1;
    const nftAmount = 1;
    
    // const erc721 = await prepareERC721(makerLeft, erc721TokenId1, [[accounts[7], 100]]); //with royalties
    const accounts = ['0x2743eEC46576f76f47334569074242F3D9a90B44', '0xf24c359B22728Ce712b81ee018344B58CEb55d51']
    let addrOriginLeft = await LibPartToUint(accounts[1], 300);
    let addrOriginRight = await LibPartToUint(accounts[0], 300);
    let encDataLeft = encDataV3_SELL({
        payouts: 0,
        originFeeFirst: addrOriginRight,
        originFeeSecond: 0,
        maxFeesBasePoint: 1000,
        marketplaceMarker: MARKET_MARKER_SELL,
    });
    
    let encDataRight = encDataV3_BUY({
        payouts: 0,
        originFeeFirst: addrOriginLeft,
        originFeeSecond: 0,
        marketplaceMarker: MARKET_MARKER_BUY,
    });
    
    const _nftSellAssetData = enc("0x73039bafa89e6f17f9a6b0b953a01af5ecabacd2", erc721TokenId1);
    const _nftPurchaseAssetData = "0x";
    const ETH = id("ETH")
    const left = Order(makerLeft, Asset(ERC721, _nftSellAssetData, nftAmount), makerRight, Asset(ETH, _nftPurchaseAssetData, _priceSell), salt, 0, 1702856612, ORDER_DATA_V3_SELL, "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000f22f838aaca272afb0f268e4f4e655fac3a35ec00000000000000000000000000000000000000000000000000000000000002ee");
    const signature = await getSignature(left, makerLeft);
    console.log(objectToTupleArray(left))
    const directPurchaseParams = {
      sellOrderMaker: makerLeft,
      sellOrderNftAmount: nftAmount,
      nftAssetClass: ERC721,
      nftData: _nftSellAssetData,
      sellOrderPaymentAmount: _priceSell,
      paymentToken: zeroAddress,
      sellOrderSalt: salt,
      sellOrderStart: 0,
      sellOrderEnd: 0,
      sellOrderDataType: ORDER_DATA_V3_SELL,
      sellOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000f22f838aaca272afb0f268e4f4e655fac3a35ec00000000000000000000000000000000000000000000000000000000000002ee",
      sellOrderSignature: signature,
      buyOrderPaymentAmount: _pricePurchase,
      buyOrderNftAmount: nftAmount,
      buyOrderData: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000f22f838aaca272afb0f268e4f4e655fac3a35ec00000000000000000000000000000000000000000000000000000000000002ee"
    };
    return directPurchaseParams;
}

function objectToTupleArray(obj) {
    return Object.values(obj).map(value => {
        if (typeof value === 'number') {
            // Convert number to string
            return value.toString();
        } else if (typeof value === 'string') {
            if (value.startsWith('0x')) {
                // Assuming this is byte data in hex format; keep as is
                return value;
            }
            // Regular string
            return value;
        }
        // Add here additional checks for other types if needed
        return value;
    });
}

// Call the function
generateDirectPurchaseParams()
  .then(params => {
    console.log('Generated directPurchase Parameters:', objectToTupleArray(params));
  })
  .catch(error => {
    console.error('Error generating directPurchase parameters:', error);
  });
