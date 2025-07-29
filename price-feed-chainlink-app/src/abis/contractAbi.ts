export const chainLinkPriceFeedAbi = [
  {
    name: "getTokenList",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        components: [
          { name: "token", type: "address" },
          { name: "symbol", type: "string" }
        ],
        name: "tokenList",
        type: "tuple[]"
      }
    ]
  },
  {
    name: "getLatestPrice",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      { name: "price", type: "int256" },
      { name: "decimals", type: "uint8" }
    ]
  },
  {
    name: "getWBTCPriceInUSDT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "price", type: "int256" },
      { name: "decimals", type: "uint8" }
    ]
  },
  {
    name: "feedDecimals",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "uint8" }]
  }
] as const; // Add 'as const' for better type inference