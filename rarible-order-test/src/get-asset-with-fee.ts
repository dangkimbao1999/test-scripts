import type { Asset } from "@rarible/ethereum-api-client"
import { toBigNumber } from "@rarible/types"
import { BigNumber, toBn } from "@rarible/utils"

export function getAssetWithFee(asset: Asset, fee: number) {
	if (asset.assetType.assetClass === "ETH" || asset.assetType.assetClass === "ERC20") {
		return addFee(asset, fee)
	} else {
		return asset
	}
}


export function addFee(asset: Asset, fee: number | BigNumber): Asset {
	const value = toBn(asset.value)
		.multipliedBy(toBn(fee).plus(10000))
		.dividedBy(10000)
		.integerValue(BigNumber.ROUND_FLOOR)

	return {
		...asset,
		value: toBigNumber(value.toFixed()),
	}
}
