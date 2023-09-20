const { ethers, deployments: { get } } = require("hardhat");

async function main() {
  const fraxBondDepositoryArtifact = await get("DaiBondDepository");
  const daiBondDepositoryArtifact = await get("DaiBondDepositoryV2");
  const wrappedTokenBondDepositoryArtifact = await get("WrappedTokenBondDepository");
  const redeemHelperArtifact = await get("RedeemHelper");
  const redeemHelper = (await ethers.getContractFactory("RedeemHelper")).attach(
    redeemHelperArtifact.address
  );
  await redeemHelper.addBondContract(daiBondDepositoryArtifact.address);
  // await redeemHelper.addBondContract(DaiBondDepositoryArtifact.address);
  // await redeemHelper.addBondContract(wrappedTokenBondDepositoryArtifact.address);

}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
