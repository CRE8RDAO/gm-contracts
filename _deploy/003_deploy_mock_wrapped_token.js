const { config } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const chainId = await getChainId();
  if (chainId === '31337' || chainId === '4002' || chainId === '4') {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const { name, symbol } = config.protocolParameters[chainId].wrappedToken;

    await deploy('WrappedToken', {
      from: deployer,
      args: [name, symbol],
      log: true,
    });
  }
};
module.exports.tags = ['WrappedToken', 'TestingOnly'];