const { config, getChainId } = require("hardhat");
const getTokenAddress = require("../../utils/getTokenAddress");

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

  //const daiAddress = await getTokenAddress({ chainId, tokenName: 'dai', get });
  const daiAddress = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';

  // NOTE: https://hardhat.org/guides/compile-contracts.html#reading-artifacts
  const contractPath = 'contracts/DaiBondDepositoryV2.sol:DaiBondDepository';

  await deploy('DaiBondDepositoryV2', {
    contract: contractPath,
    from: deployer,
    args: [
      brickArtifact.address,
      daiAddress,
      treasuryArtifact.address,
      daoAddress,
      bondCalculatorAddress,
    ],
    log: true,
  });
};
module.exports.tags = ['DaiBondDepositoryV2', 'AllEnvironments'];