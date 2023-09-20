const { ethers, getChainId, config } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const treasuryArtifact = await get('OlympusTreasury');
  const brickArtifact = await get('OlympusERC20Token');

  const chainId = await getChainId();
  const epochLength = config.protocolParameters[chainId].epochLength;
  // TODO: nextEpochTime is TBD. For now I will just set it to
  // the current block timestamp + epoch length.
  const currentBlockNumber = await ethers.provider.getBlockNumber();
  const currentBlock = await ethers.provider.getBlock(currentBlockNumber);
  const nextEpochTime = currentBlock.timestamp + epochLength;

  await deploy('Distributor', {
    from: deployer,
    args: [
      treasuryArtifact.address,
      brickArtifact.address,
      epochLength,
      nextEpochTime,
    ],
    log: true,
  });
};
module.exports.tags = ['StakingDistributor', 'AllEnvironments'];