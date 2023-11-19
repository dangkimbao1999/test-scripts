import { AssetType, Erc1155AssetType, Erc1155LazyAssetType, Erc721AssetType, Erc721LazyAssetType } from "@rarible/ethereum-api-client"
import { Address, Word, toBigNumber, toWord } from "@rarible/types"
// import { Address } from "ethereumjs-util"
import type { BigNumberValue } from "@rarible/utils/build/bn"
import { toBn } from "@rarible/utils/build/bn"
import { SimpleOrder } from "./types"
const ZERO = toWord("0x0000000000000000000000000000000000000000000000000000000000000000")

function isNft(
	type: AssetType,
): type is (Erc721AssetType | Erc1155AssetType | Erc721LazyAssetType | Erc1155LazyAssetType) {
	switch (type.assetClass) {
		case "ERC721":
		case "ERC721_LAZY":
		case "ERC1155":
		case "ERC1155_LAZY":
		case "CRYPTO_PUNKS":
			return true
		default:
			return false
	}
}

function calculateAmounts(
	make: BigNumberValue,
	take: BigNumberValue,
	amount: BigNumberValue,
	bid: boolean
): [BigNumberValue, BigNumberValue] {
	if (bid) {
		return [amount, toBn(amount).multipliedBy(make).div(take)]
	} else {
		return [toBn(amount).multipliedBy(take).div(make), amount]
	}
}

function checkValue(value: BigNumberValue) {
	if (parseFloat(value.toString()) < 1) {
		throw new Error("Invalid order. Price per one item is less than minimum allowable currency amount.")
	}
}

export function invertOrder<T extends SimpleOrder>(
	order: T,
	amount: BigNumberValue,
	maker: Address,
	salt: Word = ZERO
): T {
	const isBid = isNft(order.take.assetType) || order.take.assetType.assetClass === "COLLECTION"

	const [makeValue, takeValue] = calculateAmounts(
		toBn(order.make.value),
		toBn(order.take.value),
		amount,
		isBid
	)

	checkValue(isBid ? takeValue : makeValue )

	return {
		...order,
		make: {
			...order.take,
			value: toBigNumber(makeValue.toString()),
		},
		take: {
			...order.make,
			value: toBigNumber(takeValue.toString()),
		},
		maker,
		taker: order.maker,
		salt,
		signature: undefined,
	}
}