import type { AssetType, Word } from "@rarible/ethereum-api-client"
import type { Ethereum } from "@rarible/ethereum-provider"
import { toWord } from "@rarible/types"
import { keccak256 } from "ethereumjs-util"
import { Web3 } from 'web3';

const web3 = new Web3('');
function id(value: string): string {
	return id32(value).substring(0, 10)
}

export function id32(value: string): Word {
	return toWord(`0x${keccak256(Buffer.from(value)).toString("hex")}`)
}

export function assetTypeToStruct(assetType: AssetType) {
	switch (assetType.assetClass) {
		case "ETH":
			return {
				assetClass: id("ETH"),
				data: "0x",
			}
		case "ERC20":
			return {
				assetClass: id("ERC20"),
				data: web3.eth.abi.encodeParameter("address", assetType.contract),
			}
		case "GEN_ART":
			return {
				assetClass: id("GEN_ART"),
				data: web3.eth.abi.encodeParameter("address", assetType.contract),
			}
		case "COLLECTION":
			return {
				assetClass: id("COLLECTION"),
				data: web3.eth.abi.encodeParameter("address", assetType.contract),
			}
		case "CRYPTO_PUNKS":
			return {
				assetClass: id("CRYPTO_PUNKS"),
				data: web3.eth.abi.encodeParameter(
					{ root: CONTRACT_TOKEN_ID },
					{ contract: assetType.contract, tokenId: assetType.tokenId }
				),
			}
		case "ERC721":
			return {
				assetClass: id("ERC721"),
				data: web3.eth.abi.encodeParameter(
					{ root: CONTRACT_TOKEN_ID },
					{ contract: assetType.contract, tokenId: assetType.tokenId }
				),
			}
		case "ERC1155":
			return {
				assetClass: id("ERC1155"),
				data: web3.eth.abi.encodeParameter(
					{ root: CONTRACT_TOKEN_ID },
					{ contract: assetType.contract, tokenId: assetType.tokenId }
				),
			}
		case "ERC721_LAZY": {
			const encoded = web3.eth.abi.encodeParameter(ERC721_LAZY_TYPE, {
				contract: assetType.contract,
				data: {
					tokenId: assetType.tokenId,
					uri: assetType.uri,
					creators: assetType.creators,
					royalties: assetType.royalties,
					signatures: assetType.signatures,
				},
			})
			return {
				assetClass: id("ERC721_LAZY"),
				data: `0x${encoded.substring(66)}`,
			}
		}
		case "ERC1155_LAZY": {
			const encoded = web3.eth.abi.encodeParameter(ERC1155_LAZY_TYPE, {
				contract: assetType.contract,
				data: {
					tokenId: assetType.tokenId,
					uri: assetType.uri,
					supply: assetType.supply,
					creators: assetType.creators,
					royalties: assetType.royalties,
					signatures: assetType.signatures,
				},
			})
			return {
				assetClass: id("ERC1155_LAZY"),
				data: `0x${encoded.substring(66)}`,
			}
		}
		default: {
			throw new Error("Unsupported asset class")
		}
	}
}

const CONTRACT_TOKEN_ID = {
	contract: "address",
	tokenId: "uint256",
}

const ERC721_LAZY_TYPE = {
	components: [
		{
			name: "contract",
			type: "address",
		},
		{
			components: [
				{
					name: "tokenId",
					type: "uint256",
				},
				{
					name: "uri",
					type: "string",
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
					name: "creators",
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
					name: "royalties",
					type: "tuple[]",
				},
				{
					name: "signatures",
					type: "bytes[]",
				},
			],
			name: "data",
			type: "tuple",
		},
	],
	name: "data",
	type: "tuple",
}

const ERC1155_LAZY_TYPE = {
	components: [
		{
			name: "contract",
			type: "address",
		},
		{
			components: [
				{
					name: "tokenId",
					type: "uint256",
				},
				{
					name: "uri",
					type: "string",
				},
				{
					name: "supply",
					type: "uint256",
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
					name: "creators",
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
					name: "royalties",
					type: "tuple[]",
				},
				{
					name: "signatures",
					type: "bytes[]",
				},
			],
			name: "data",
			type: "tuple",
		},
	],
	name: "data",
	type: "tuple",
}
