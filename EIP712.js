const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');

const DOMAIN_TYPE = [
  {
    type: "string",
    name: "name"
  },
	{
		type: "string",
		name: "version"
	},
  {
    type: "uint256",
    name: "chainId"
  },
  {
    type: "address",
    name: "verifyingContract"
  }
];

module.exports = {
  createTypeData: function (domainData, primaryType, message, types) {
    return {
      types: Object.assign({
        EIP712Domain: DOMAIN_TYPE,
      }, types),
      domain: domainData,
      primaryType: primaryType,
      message: message
    };
  },

//   signTypedData: function (web3, from, data) {
//     return new Promise(async (resolve, reject) => {
//       function cb(err, result) {
//         if (err) {
//           return reject(err);
//         }
//         if (result.error) {
//           return reject(result.error);
//         }

//         const sig = result.result;
//         const sig0 = sig.substring(2);
//         const r = "0x" + sig0.substring(0, 64);
//         const s = "0x" + sig0.substring(64, 128);
//         const v = parseInt(sig0.substring(128, 130), 16);

//         resolve({
//           data,
//           sig,
//           v, r, s
//         });
//       }
//       if (web3.currentProvider.isMetaMask) {
//         web3.currentProvider.sendAsync({
//           jsonrpc: "2.0",
//           method: "eth_signTypedData_v3",
//           params: [from, JSON.stringify(data)],
//           id: new Date().getTime()
//         }, cb);
//       } else {
//         try {
//           let send = web3.currentProvider.sendAsync;
//           if (!send) send = web3.currentProvider.send;
//           send.bind(web3.currentProvider)({
//             jsonrpc: "2.0",
//             method: "eth_signTypedData",
//             params: [from, data],
//             id: new Date().getTime()
//           }, cb);
//           console.log('shit')
//         } catch (err) {
//           console.log(err)
//         }
//       }
//     });
//   }
// };

signTypedData: function(web3, from, data) {
  return new Promise((resolve, reject) => {
      // You must securely get the private key corresponding to 'from'
      const privateKey = "0x2e0b716a5a37a69980849144cde8c911d80f07cff3aea1398d65b9c6ff8e6a26" // Implement this function

      if (!privateKey) {
          return reject(new Error("Private key not found for address " + from));
      }

      try {
          const privateKeyBuffer = ethUtil.toBuffer(privateKey);
          console.log('haha')
          const signature = sigUtil.signTypedData_v4(privateKeyBuffer, {
              data: data
          });
          console.log(signature)
          // Extract v, r, s components from the signature
          const sig0 = signature.substring(2);
          const r = "0x" + sig0.substring(0, 64);
          const s = "0x" + sig0.substring(64, 128);
          const v = parseInt(sig0.substring(128, 130), 16);

          resolve({
              data,
              sig: signature,
              v, r, s
          });
      } catch (error) {
          reject(error);
      }
  });
}
}