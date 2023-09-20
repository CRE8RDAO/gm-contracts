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
  const priceFeedAddress = config.contractAddresses[chainId].priceFeed;

  // const wrappedTokenAddress = await getTokenAddress({ chainId, tokenName: 'wrappedToken', get });
  const wrappedTokenAddress = '0x4200000000000000000000000000000000000006';

  // NOTE: https://hardhat.org/guides/compile-contracts.html#reading-artifacts
  const contractPath = 'contracts/wETHBondDepository.sol:OlympusBondDepository';

  await deploy('WrappedTokenBondDepository', {
    contract: contractPath,
    from: deployer,
    args: [
      brickArtifact.address,
      wrappedTokenAddress,
      treasuryArtifact.address,
      daoAddress,
      priceFeedAddress,
    ],
    log: true,
  });
};
module.exports.tags = ['WrappedTokenBondDepository', 'AllEnvironments'];