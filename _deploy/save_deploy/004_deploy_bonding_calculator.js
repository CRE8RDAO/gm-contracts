module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const contractPath = 'contracts/VelociBondingCalculator.sol:VelocimeterBondingCalculator';

  const brickArtifact = await get('OlympusERC20Token');
  await deploy('VelociBondingCalculator', {
    contract: contractPath,
    from: deployer,
    args: [
      brickArtifact.address,
    ],
    log: true,
  });
};
module.exports.tags = ['VelociBondingCalculator', 'AllEnvironments'];