const { config, ethers, deployments: { get }, getChainId } = require("hardhat");

async function main() {
    const chainId = await getChainId();
    // restrict this to testnets for now
    // if (['4', '4002'].indexOf(chainId) === -1) {
    //     throw new Error('This can only be done on testnets!');
    // }

    const zeroAddress = config.contractAddresses.zero;

    const bondAddress = (await get('BrickFraxBondDepository')).address;
    console.log(`Bond depository address is ${bondAddress}`);

    const treasuryAddress = (await get('OlympusTreasury')).address;
    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryAddress);

    const currentBlockNumber = await ethers.provider.getBlockNumber();
    console.log(`currentBlockNumber is ${currentBlockNumber}`);

    // approve BRICK-FRAX LP bond depository as liquidity token depositor
    const bondLiquidityDepositorToggleBlockNumber = await treasury.LiquidityDepositorQueue(bondAddress);
    console.log(`bondLiquidityDepositorToggleBlockNumber is ${bondLiquidityDepositorToggleBlockNumber}`);

    if (currentBlockNumber > bondLiquidityDepositorToggleBlockNumber) {
      await treasury.toggle('4', bondAddress, zeroAddress);
    }

    const { brickFraxUniswapV2Pair } = config.contractAddresses[chainId];
    const bondCalculatorArtifact = await get('OlympusBondingCalculator');
    // approve BRICK-FRAX LP as liquidity token
    const liquidityTokenToggleBlockNumber = await treasury.LiquidityTokenQueue(brickFraxUniswapV2Pair);
    console.log(`liquidityTokenToggleBlockNumber is ${liquidityTokenToggleBlockNumber}`);

    if (currentBlockNumber > liquidityTokenToggleBlockNumber) {
      await treasury.toggle('5', brickFraxUniswapV2Pair, bondCalculatorArtifact.address);
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
