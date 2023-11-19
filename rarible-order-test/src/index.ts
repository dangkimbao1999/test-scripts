import { OrderRaribleV2DataV2, OrderRaribleV2DataV3Buy, OrderRaribleV2DataV3Sell, Word } from "@rarible/ethereum-api-client";
import { ZERO_ADDRESS, ZERO_WORD, randomWord, toAddress, toWord } from "@rarible/types";
import { encodeRaribleV2OrderData } from "./main";
// import { RaribleV2OrderHandler } from "./order";

function execute() {
    const data: OrderRaribleV2DataV2 = {
        dataType: "RARIBLE_V2_DATA_V2",
        payouts: [],
        originFees:[{
            account: toAddress("0x0f22f838aaca272afb0f268e4f4e655fac3a35ec"),
            value: 1
        }],
        isMakeFill: false
        // originFeeSecond: {
        //     account: ZERO_ADDRESS,
        //     value: 0,
        // },
    }
    // const data1: OrderRaribleV2DataV3Buy = {
    //     dataType: "RARIBLE_V2_DATA_V3_BUY",
    //     payout: {
    //         account: toAddress('0x2743eEC46576f76f47334569074242F3D9a90B44'),
    //         value: 100
    //     },
    //     originFeeFirst: {
    //         account: ZERO_ADDRESS,
    //         value: 0
    //     },
    //     originFeeSecond: {
    //         account: ZERO_ADDRESS,
    //         value: 0,
    //     },
    //     marketplaceMarker: ZERO_WORD
    // }
    const res = encodeRaribleV2OrderData(data);
    // const res1 = encodeRaribleV2OrderData(data1);
    console.log('sell order: ', res);
    // console.log('buy order: ', res1);
    // console.log(randomWord())
    return data;
    // const a = new RaribleV2OrderHandler("RARIBLE_V2");
    // await getTransactionData(order1, order2);
}

execute();