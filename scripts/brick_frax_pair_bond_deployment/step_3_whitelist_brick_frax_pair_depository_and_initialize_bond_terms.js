const { config, ethers, deployments: { get }, getChainId } = require("hardhat");

async function main() {
    const chainId = await getChainId();
    // restrict this to testnets for now
    // if (['4', '4002'].indexOf(chainId) === -1) {
    //     throw new Error('This can only be done on testnets!');
    // }

    const treasuryArtifact = await get('OlympusTreasury');
    const stakingHelperArtifact = await get('StakingHelper');
    const bondDepositoryArtifact = await get('BrickFraxBondDepository');

  //const bondDepositoryArtifact = "0x0bEc648cCDE8a30a2650F622E8dE3A4e94D456Dc";

    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryArtifact.address);

    // Set BRICK-FRAX bond terms
    // NOTE: Grant BRICK-FRAX bond depositor a liquidity depositor role
    const liquidityDepositorQueueTimestamp = await treasury.LiquidityDepositorQueue(bondDepositoryArtifact.address);
    if (liquidityDepositorQueueTimestamp.eq(0)) {
      await treasury.queue('4', bondDepositoryArtifact.address);
    }

    const { brickFraxUniswapV2Pair } = config.contractAddresses[chainId];

    const liquidityTokenQueueTimestamp = await treasury.LiquidityTokenQueue(brickFraxUniswapV2Pair);
    if (liquidityTokenQueueTimestamp.eq(0)) {
      await treasury.queue('5', brickFraxUniswapV2Pair);
    }

    const bond = (
      await ethers.getContractFactory('contracts/BondDepository.sol:OlympusBondDepository')
    ).attach(bondDepositoryArtifact.address);

    // NOTE: Use staking helper.
    const currentStakingHelper = await bond.stakingHelper();
    if (currentStakingHelper === config.contractAddresses.zero) {
      await bond.setStaking(stakingHelperArtifact.address, true);
    }

    // TODO: Just copying params from
    // https://etherscan.io/tx/0xe2dcf8abc6aabb9ff877442b0727165b05c300e0e4dae1b1890c242c222916ff
    // for now. Need to adjust at least bondVestingLength, minBondPrice, maxBondPayout.
    const bondBCV = 285;

    // 5 days
    const bondVestingLength = 432000;
    const minBondPrice = 1000;
    // 0.05% of BRICK supply
    const maxBondPayout = 50;

    // bonding fee given to the DAO (100%)
    const bondFee = 10000;

    const maxBondDebt = ethers.utils.parseUnits('700000', 9);
    const initialBondDebt = 0;

    const currentTerms = await bond.terms();
    if (currentTerms.controlVariable.eq(0)) {
      await bond.initializeBondTerms(
        bondBCV,
        bondVestingLength,
        minBondPrice,
        maxBondPayout,
        bondFee,
        maxBondDebt,
        initialBondDebt,
      );
    }
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
