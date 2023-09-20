const { ethers, getChainId, config } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const brickArtifact = await get('OlympusERC20Token');
  const sBrickArtifact = await get('sOlympus');
  const distributorArtifact = await get('Distributor');
  const chainId = await getChainId();
  const epochLength = config.protocolParameters[chainId].epochLength;

  const distributor = (
    await ethers.getContractFactory('Distributor')
  ).attach(distributorArtifact.address);
  // TODO: Fix this.
  const firstEpochTime = await distributor.nextEpochTime();
  // TODO: What should firstEpochNumber be?
  // I guess it doesn't matter what it is as it is only used for tracking warmup period.
  // NOTE: ok so it has to be at least 1, otherwise claim doesn't work.
  const firstEpochNumber = 1;

  await deploy('OlympusStaking', {
    from: deployer,
    args: [
      brickArtifact.address,
      sBrickArtifact.address,
      epochLength,
      firstEpochNumber,
      firstEpochTime,

    ],
    log: true,
  });
};
module.exports.tags = ['Staking', 'AllEnvironments'];