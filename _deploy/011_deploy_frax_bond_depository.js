const { config, getChainId } = require("hardhat");
const getTokenAddress = require("../utils/getTokenAddress");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const brickArtifact = await get('OlympusERC20Token');
  const treasuryArtifact = await get('OlympusTreasury');
  // TODO: Setting it to our Fantom multi-sig for now, not sure what to put yet.
  const daoAddress = config.contractAddresses[chainId].dao;
  // NOTE: Only LP bond requires bond calculator
  const bondCalculatorAddress = config.contractAddresses.zero;

  //const fraxAddress = await getTokenAddress({ chainId, tokenName: 'frax', get });
  const fraxAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';

  // NOTE: https://hardhat.org/guides/compile-contracts.html#reading-artifacts
  const contractPath = 'contracts/BondDepository.sol:OlympusBondDepository';

  await deploy('FraxBondDepository', {
    contract: contractPath,
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
};
module.exports.tags = ['FraxBondDepository', 'AllEnvironments'];