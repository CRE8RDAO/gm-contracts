const { getChainId } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const { name, symbol } = config.protocolParameters[chainId].brick;

  await deploy('OlympusERC20Token', {
    from: deployer,
    args: [name, symbol],
    log: true,
  });
};
module.exports.tags = ['Brick', 'AllEnvironments'];