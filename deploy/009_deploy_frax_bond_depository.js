const { config, getChainId, ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const brickArtifact = await get('OlympusERC20Token');
  const treasuryArtifact = await get('OlympusTreasury');
  // TODO: Setting it to our Fantom multi-sig for now, not sure what to put yet.
  const daoAddress = "0xba5c251Cffc942C8e16e2315024c7D4B7D76Bea8";
  // NOTE: Only LP bond requires bond calculator
  const bondCalculatorAddress = config.contractAddresses.zero;

  let fraxAddress;
  // TODO: move it to config
  switch(chainId) {
    case '250':
      fraxAddress = config.contractAddresses[chainId].frax;
      break;
    default:
      const frax = await get('FRAX');
      fraxAddress = frax.address;
      break;
  }

  // NOTE: https://hardhat.org/guides/compile-contracts.html#reading-artifacts
  const deployment = await deploy('FraxBondDepository', {
    contract: 'contracts/BondDepository.sol:OlympusBondDepository',
    from: deployer,
    args: [
      brickArtifact.address,
      fraxAddress,
      treasuryArtifact.address,
      daoAddress,
      bondCalculatorAddress,
    ],
    log: true,
  });

  const treasury = (
    await ethers.getContractFactory('OlympusTreasury')
  ).attach(treasuryArtifact.address);
  // NOTE: Grant FRAX bond depositor a reserve depositor role
  await treasury.queue('0', deployment.address);
  // TODO: this can only be done after blocksNeededForQueue has passed.
  // await treasury.toggle('0', deployment.address, config.contractAddresses.zero);

  const fraxBond = (
    await ethers.getContractFactory('contracts/BondDepository.sol:OlympusBondDepository')
  ).attach(deployment.address);

  // NOTE: Use staking helper.
  const stakingHelperArtifact = await get('StakingHelper');
  await fraxBond.setStaking(stakingHelperArtifact.address, true);

  // TODO:
  // await fraxBond.initializeBondTerms(fraxBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);
};
module.exports.tags = ['Staking', 'AllEnvironments'];