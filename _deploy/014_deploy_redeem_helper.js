const { getChainId } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy('RedeemHelper', {
    from: deployer,
    args: [],
    log: true,
  });
};
module.exports.tags = ['RedeemHelper', 'AllEnvironments'];