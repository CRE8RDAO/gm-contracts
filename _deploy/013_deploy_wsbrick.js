const { getChainId } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const stakingArtifact = await get('OlympusStaking');
  const brickArtifact = await get('OlympusERC20Token');
  const sfBrickArtifact = await get('sOlympus');

  const chainId = await getChainId();
  const { name, symbol } = config.protocolParameters[chainId].wsbrick;

  await deploy('wOHM', {
    from: deployer,
    args: [
      stakingArtifact.address,
      brickArtifact.address,
      sfBrickArtifact.address,
      name,
      symbol,
    ],
    log: true,
  });
};
module.exports.tags = ['wsBRICK', 'AllEnvironments'];