require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("@nomiclabs/hardhat-etherscan");

require("dotenv").config();
const {
  MAINNET_PRIVATE_KEY,
  TESTNET_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  RINKEBY_ALCHEMY_API,
} = process.env;

module.exports = {
  solidity: "0.7.5",
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    opera: {
      chainId: 250,
      url: "https://rpc.ftm.tools",
      accounts: [
        MAINNET_PRIVATE_KEY,
      ]
    },
    rinkeby: {
      chainId: 4,
      url: RINKEBY_ALCHEMY_API,
      accounts: [
        TESTNET_PRIVATE_KEY,
      ],
    },
    ftmTestnet: {
      chainId: 4002,
      url: "https://rpc.testnet.fantom.network",
      accounts: [
        TESTNET_PRIVATE_KEY,
      ],
    },
  },
  protocolParameters: {
    '250': {
      // NOTE: Average block time in Ethereum is ~13 seconds and
      // Olympus's treasury's blocksNeededForQueue is 6,000.
      // Fantom's average block time is ~0.9 seconds so I make it
      // 6,000 / 0.9 which is approximately 6,600 blocks.
      blocksNeededForQueue: 6600,
      epochLength: 28800, // seconds
      brick: {
        name: 'fBrick',
        symbol: 'fBRICK',
      },
      sbrick: {
        name: 'Staked fBrick',
        symbol: 'sfBRICK',
      },
      wsbrick: {
        name: 'Wrapped sfBRICK',
        symbol: 'wsfBRICK',
      },
    },
    '4': {
      blocksNeededForQueue: 0,
      epochLength: 28800, // seconds
      wrappedToken: {
        name: 'Wrapped Ether',
        symbol: 'WETH',
      },
      brick: {
        name: 'Brick',
        symbol: 'BRICK',
      },
      sbrick: {
        name: 'Staked Brick',
        symbol: 'sBRICK',
      },
      wsbrick: {
        name: 'Wrapped sBRICK',
        symbol: 'wsBRICK',
      },
    },
    '4002': {
      blocksNeededForQueue: 0,
      epochLength: 28800, // seconds
      wrappedToken: {
        name: 'Wrapped Fantom',
        symbol: 'WFTM',
      },
      brick: {
        name: 'fBrick',
        symbol: 'fBRICK',
      },
      sbrick: {
        name: 'Staked fBrick',
        symbol: 'sfBRICK',
      },
      wsbrick: {
        name: 'Wrapped sfBRICK',
        symbol: 'wsfBRICK',
      },
    },
    '31337': {
      blocksNeededForQueue: 0,
      epochLength: 28800, // seconds
      wrappedToken: {
        name: 'Wrapped Ether',
        symbol: 'WETH',
      },
      brick: {
        name: 'Brick',
        symbol: 'BRICK',
      },
      sbrick: {
        name: 'Staked Brick',
        symbol: 'sBRICK',
      },
      wsbrick: {
        name: 'Wrapped sBRICK',
        symbol: 'wsBRICK',
      },
    },
  },
  contractAddresses: {
    '250': {
      dao: '0x71Aa3467e12E2b562a0E792D831933998490C998',
      frax: '0xaf319E5789945197e365E7f7fbFc56B130523B33',
      wrappedToken: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // WFTM
      priceFeed: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    },
    '4': {
      dao: '0xA38F4E6718EdCF023a1d032a2193848CB932c8e3', // testnet deployer address
      priceFeed: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
      uniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // Uniswap V2 factory
      uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 router
      brickFraxUniswapV2Pair: '0x088ce658Db1AB9e8B0BD62d75964Ac8f88f27aeA',
    },
    '4002': {
      dao: '0xA38F4E6718EdCF023a1d032a2193848CB932c8e3', // testnet deployer address
      priceFeed: '0xe04676B9A9A2973BCb0D1478b5E1E9098BBB7f3D',
      uniswapV2Factory: '0x25A52e80ABca73318d99fe8B5fbC19aBd5AA98FD', // SpiritSwap factory
      uniswapV2Router: '0x2a03c4B4130C4Db5D3ad2515DE99b62Ba57A6917', // SpiritSwap router
    },
    '31337': {
      dao: '0x71Aa3467e12E2b562a0E792D831933998490C998',
      priceFeed: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    },
    zero: '0x0000000000000000000000000000000000000000',
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
