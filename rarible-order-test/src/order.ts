import type { Address } from "@rarible/ethereum-api-client"
import type {
	Ethereum,
	EthereumFunctionCall,
	EthereumSendOptions,
} from "@rarible/ethereum-provider"
import { ZERO_ADDRESS, ZERO_WORD } from "@rarible/types"
// import type { Maybe } from "@rarible/types/build/maybe"
// import { hashToSign, orderToStruct, signOrder } from "../sign-order"
import { getAssetWithFee } from "./get-asset-with-fee"
// import type { EthereumConfig } from "../../config/type"
// import type { SendFunction } from "../../common/send-transaction"
// import { createExchangeV2Contract } from "../contracts/exchange-v2"
import type { SimpleOrder, SimpleRaribleV2Order } from "./types"
// import { isSigner } from "../../common/is-signer"
import { fixSignature } from "./fix-signature"
// import type { IRaribleEthereumSdkConfig } from "../../types"
import { assetTypeToStruct } from "./asset-type-to-struct"
import { encodeRaribleV2OrderData } from "./main"
import { isETH } from "./eth"
import { invertOrder } from "./invert-order"
import type {
	OrderFillSendData,
	OrderHandler,
	RaribleV2OrderFillRequest,
	RaribleV2OrderFillRequestV2,
	RaribleV2OrderFillRequestV3Buy,
	RaribleV2OrderFillRequestV3Sell,
} from "./types1"

export class RaribleV2OrderHandler implements OrderHandler<RaribleV2OrderFillRequest> {

	constructor(
		// private readonly ethereum: Maybe<Ethereum>,
		// private readonly send: SendFunction,
		// private readonly config: EthereumConfig,
		private readonly getBaseOrderFeeConfig: (type: SimpleOrder["type"]) => Promise<number>,
		// private readonly sdkConfig?: IRaribleEthereumSdkConfig
	) { }

	invert(request: RaribleV2OrderFillRequest, maker: Address): SimpleRaribleV2Order {
		const inverted = invertOrder(request.order, request.amount, maker)
		switch (request.order.data.dataType) {
			case "RARIBLE_V2_DATA_V1": {
				inverted.data = {
					dataType: "RARIBLE_V2_DATA_V1",
					originFees: (request as RaribleV2OrderFillRequestV2).originFees || [],
					payouts: (request as RaribleV2OrderFillRequestV2).payouts || [],
				}
				break
			}
			case "RARIBLE_V2_DATA_V2": {
				inverted.data = {
					dataType: "RARIBLE_V2_DATA_V2",
					originFees: (request as RaribleV2OrderFillRequestV2).originFees || [],
					payouts: (request as RaribleV2OrderFillRequestV2).payouts || [],
					isMakeFill: !request.order.data.isMakeFill,
				}
				break
			}
			case "RARIBLE_V2_DATA_V3_BUY": {
				inverted.data = {
					dataType: "RARIBLE_V2_DATA_V3_SELL",
					payout: (request as RaribleV2OrderFillRequestV3Sell).payout,
					originFeeFirst: (request as RaribleV2OrderFillRequestV3Sell).originFeeFirst,
					originFeeSecond: (request as RaribleV2OrderFillRequestV3Sell).originFeeSecond,
					maxFeesBasePoint: (request as RaribleV2OrderFillRequestV3Sell).maxFeesBasePoint,
					marketplaceMarker: (request as RaribleV2OrderFillRequestV3Sell).marketplaceMarker,
				}
				break
			}
			case "RARIBLE_V2_DATA_V3_SELL": {
				inverted.data = {
					dataType: "RARIBLE_V2_DATA_V3_BUY",
					payout: (request as RaribleV2OrderFillRequestV3Buy).payout,
					originFeeFirst: (request as RaribleV2OrderFillRequestV3Buy).originFeeFirst,
					originFeeSecond: (request as RaribleV2OrderFillRequestV3Buy).originFeeSecond,
					marketplaceMarker: (request as RaribleV2OrderFillRequestV3Buy).marketplaceMarker,
				}
				break
			}
			default: throw new Error("Unsupported order dataType")
		}
		return inverted
	}

	async approve() {

	}

	async getTransactionData(
		initial: SimpleRaribleV2Order, inverted: SimpleRaribleV2Order
	): Promise<void> {
		// if (!this.ethereum) {
		// 	throw new Error("Wallet undefined")
		// }
		// const exchangeContract = createExchangeV2Contract(this.ethereum, this.config.exchange.v2)

		if (isSellOrder(initial)) {
			const nftStruct = assetTypeToStruct(initial.make.assetType)
			const [sellOrderDataType, sellOrderData] = encodeRaribleV2OrderData(initial.data)
			const [, buyOrderData] = encodeRaribleV2OrderData(inverted.data)

			// const functionCall = exchangeContract.functionCall(
			// 	"directPurchase",
			// 	{
			// 		sellOrderMaker: initial.maker,
			// 		sellOrderNftAmount: initial.make.value,
			// 		nftAssetClass: nftStruct.assetClass,
			// 		nftData: nftStruct.data,
			// 		sellOrderPaymentAmount: initial.take.value,
			// 		paymentToken: initial.take.assetType.assetClass === "ETH" ? ZERO_ADDRESS : initial.take.assetType.contract,
			// 		sellOrderSalt: initial.salt,
			// 		sellOrderStart: initial.start ?? 0,
			// 		sellOrderEnd: initial.end ?? 0,
			// 		sellOrderDataType: sellOrderDataType,
			// 		sellOrderData: sellOrderData,
			// 		sellOrderSignature: fixSignature(initial.signature) || "0x",
			// 		buyOrderPaymentAmount: inverted.make.value,
			// 		buyOrderNftAmount: inverted.take.value,
			// 		buyOrderData: buyOrderData,
			// 	}
            //     )
                const options = await this.getMatchV2Options(initial, inverted)
				const data = {
					sellOrderMaker: initial.maker,
					sellOrderNftAmount: initial.make.value,
					nftAssetClass: nftStruct.assetClass,
					nftData: nftStruct.data,
					sellOrderPaymentAmount: initial.take.value,
					paymentToken: initial.take.assetType.assetClass === "ETH" ? ZERO_ADDRESS : initial.take.assetType.contract,
					sellOrderSalt: initial.salt,
					sellOrderStart: initial.start ?? 0,
					sellOrderEnd: initial.end ?? 0,
					sellOrderDataType: sellOrderDataType,
					sellOrderData: sellOrderData,
					sellOrderSignature: fixSignature(initial.signature) || "0x",
					buyOrderPaymentAmount: inverted.make.value,
					buyOrderNftAmount: inverted.take.value,
					buyOrderData: buyOrderData,
				}
                console.log(data, options)

			// return {
			// 	functionCall: null,
			// 	options,
			// }
		} 
        // else {
		// 	let functionCall: EthereumFunctionCall
		// 	if (isCollectionOrder(initial)) {
		// 		functionCall = exchangeContract.functionCall(
		// 			"matchOrders",
		// 			await this.fixForTx(initial),
		// 			fixSignature(initial.signature) || "0x",
		// 			orderToStruct(this.ethereum, inverted),
		// 			fixSignature(inverted.signature) || "0x",
		// 		)
		// 	} else {
		// 		const nftStruct = assetTypeToStruct(this.ethereum, initial.take.assetType)
		// 		const [, sellOrderData] = encodeRaribleV2OrderData(this.ethereum, inverted.data)
		// 		const [buyOrderDataType, buyOrderData] = encodeRaribleV2OrderData(this.ethereum, initial.data)

		// 		functionCall = exchangeContract.functionCall(
		// 			"directAcceptBid",
		// 			{
		// 				bidMaker: initial.maker,
		// 				bidNftAmount: initial.take.value,
		// 				nftAssetClass: nftStruct.assetClass,
		// 				nftData: nftStruct.data,
		// 				bidPaymentAmount: initial.make.value,
		// 				paymentToken: initial.make.assetType.assetClass === "ETH" ? ZERO_ADDRESS : initial.make.assetType.contract,
		// 				bidSalt: initial.salt,
		// 				bidStart: initial.start ?? 0,
		// 				bidEnd: initial.end ?? 0,
		// 				bidDataType: buyOrderDataType,
		// 				bidData: buyOrderData,
		// 				bidSignature: fixSignature(initial.signature) || "0x",
		// 				sellOrderPaymentAmount: inverted.take.value,
		// 				sellOrderNftAmount: inverted.make.value,
		// 				sellOrderData: sellOrderData,
		// 			}
		// 		)
		// 	}
		// 	const options = await this.getMatchV2Options(initial, inverted)

		// 	return {
		// 		functionCall,
		// 		options,
		// 	}
		// }
	}


	// async fixForTx(order: SimpleRaribleV2Order): Promise<any> {
	// 	if (!this.ethereum) {
	// 		throw new Error("Wallet undefined")
	// 	}
	// 	const hash = hashToSign(this.config, this.ethereum, order)
	// 	const isMakerSigner = await isSigner(this.ethereum, order.maker, hash, order.signature!)
	// 	return orderToStruct(this.ethereum, order, !isMakerSigner)
	// }

	async getMatchV2Options(
		left: SimpleRaribleV2Order, right: SimpleRaribleV2Order,
	): Promise<EthereumSendOptions> {
		if (isETH(left.make.assetType) && left.salt === ZERO_WORD) {
			const asset = await this.getMakeAssetWithFee(left)
			return { value: asset.value }
		} else if (isETH(right.make.assetType) && right.salt === ZERO_WORD) {
			const asset = await this.getMakeAssetWithFee(right)
			return { value: asset.value }
		} else {
			return { value: 0 }
		}
	}

	async getMakeAssetWithFee(order: SimpleRaribleV2Order) {
		return getAssetWithFee(order.make, await this.getOrderFee(order))
	}

	async getOrderFee(order: SimpleRaribleV2Order): Promise<number> {
		switch (order.data.dataType) {
			case "RARIBLE_V2_DATA_V1":
			case "RARIBLE_V2_DATA_V2":
				return order.data.originFees.map(f => f.value).reduce((v, acc) => v + acc, 0) + await this.getBaseOrderFee()
			case "RARIBLE_V2_DATA_V3_BUY":
			case "RARIBLE_V2_DATA_V3_SELL":
				return (order.data.originFeeFirst?.value ?? 0) +
					(order.data.originFeeSecond?.value ?? 0) +
					await this.getBaseOrderFee()
			default:
				throw new Error("Unsupported order dataType")
		}
	}

	async getBaseOrderFee(): Promise<number> {
		return this.getBaseOrderFeeConfig("RARIBLE_V2")
	}
}

/**
 * Check if order selling something for currency
 */
function isSellOrder(order: SimpleOrder): boolean {
	return order.take.assetType.assetClass === "ETH" || order.take.assetType.assetClass === "ERC20"
}

function isCollectionOrder(order: SimpleOrder): boolean {
	return order.take.assetType.assetClass === "COLLECTION"
}

const order1: SimpleRaribleV2Order = {
    // Populate with appropriate data
    data: /* ... */,
    maker: /* ... */,
    taker: /* ... */,
    make: /* ... */,
    take: /* ... */,
    salt: /* ... */,
    start: /* ... */,
    end: /* ... */,
    type: /* ... */,
    signature: /* ... */
};

const order2: SimpleRaribleV2Order = {
    // Populate with appropriate data
    // ...
};