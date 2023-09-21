require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("@nomiclabs/hardhat-etherscan");

require("dotenv").config();
// console.log(process.env)
const {
  MAINNET_PRIVATE_KEY,
  TESTNET_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  MAINNET_ALCHEMY_API,
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
    base: {
      chainId: 8453,
      url: MAINNET_ALCHEMY_API,
      accounts: [
        MAINNET_PRIVATE_KEY,
      ],
      verify: {
        etherscan: {
          apiKey: '5JGRDZGJ2875NQD5Q2RIJ82MZNPP3FGNHB',
          apiUrl: 'https://api.basescan.org/'
        }
      }
    }
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
    '8453': {
      blocksNeededForQueue: 0,
      epochLength: 28800, // seconds
      wrappedToken: {
        name: 'Wrapped Ether',
        symbol: 'WETH',
      },
      brick: {
        name: 'FriendTech33',
        symbol: 'FTW',
      },
      sbrick: {
        name: 'Staked FTW',
        symbol: 'sFTW',
      },
      wsbrick: {
        name: 'Wrapped sFTW',
        symbol: 'wsFTW',
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
    '8453': {
      dao: '0xBbE6d178d6E11189B46ff4A9f034AB198C2E8A0f', // base ft33 safe address
      priceFeed: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
      frax: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      uniswapV2Factory: '0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB', // Velocimeter base pair factory but changed to baseswap for now
      wrappedToken: '0x4200000000000000000000000000000000000006', // WETH on base
      uniswapV2Router: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86', // Velocimeter base router but changed to baseswap for now
      brickFraxUniswapV2Pair: '0x7b809866eaa8137d902f83bf7cbe77b41d0df70c', // pair contract
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
