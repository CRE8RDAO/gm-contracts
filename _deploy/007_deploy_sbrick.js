module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = await getChainId();
  const { name, symbol } = config.protocolParameters[chainId].sbrick;

  await deploy('sOlympus', {
    from: deployer,
    args: [name, symbol],
    log: true,
  });
};
module.exports.tags = ['sBRICK', 'AllEnvironments'];