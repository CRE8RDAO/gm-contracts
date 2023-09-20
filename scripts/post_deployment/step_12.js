const { config, ethers, deployments: { get } } = require("hardhat");

async function main() {
    const treasuryArtifact = await get('OlympusTreasury');
    const stakingHelperArtifact = await get('StakingHelper');
    const daiBondDepositoryArtifact = await get('DaiBondDepository');

    const treasury = (
      await ethers.getContractFactory('OlympusTreasury')
    ).attach(treasuryArtifact.address);

    // Step 8: Set Frax bond terms
    // NOTE: Grant FRAX bond depositor a reserve depositor role
    const reserveDepositorQueueTimestamp = await treasury.reserveDepositorQueue(daiBondDepositoryArtifact.address);
    if (reserveDepositorQueueTimestamp.eq(0)) {
      await treasury.queue('0', daiBondDepositoryArtifact.address);
    }

    const daiBond = (
      await ethers.getContractFactory('contracts/DaiBondDepository.sol:DaiBondDepository')
    ).attach(daiBondDepositoryArtifact.address);

    // NOTE: Use staking helper.
    const currentStakingHelper = await daiBond.stakingHelper();
    if (currentStakingHelper === config.contractAddresses.zero) {
      await daiBond.setStaking(stakingHelperArtifact.address, true);
    }

    // TODO: Just copying params from
    // https://etherscan.io/tx/0xc83d9c015dcc177284a919d7ac5a53e3bf8788ff9e940b294b58150c53674e17 (Frax V1 bonds initializeBondTerms)
    // for now. Need to adjust at least bondVestingLength, minBondPrice, maxBondPayout.
    const fraxBondBCV = 1000;

    // 5 days
    const bondVestingLength = 432000;
    const minFraxBondPrice = 29000;
    // 0.05% of BRICK supply
    const maxFraxBondPayout = 50

    // bonding fee given to the DAO (100%)
    const bondFee = 10000;

    const maxFraxBondDebt = ethers.utils.parseUnits('700000', 9);
    const initialBondDebt = 0;

    const currentTerms = await daiBond.terms();
    if (currentTerms.controlVariable.eq(0)) {
      await daiBond.initializeBondTerms(
        fraxBondBCV,
        bondVestingLength,
        minFraxBondPrice,
        maxFraxBondPayout,
        bondFee,
        maxFraxBondDebt,
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