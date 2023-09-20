const { ethers, deployments: { get }, getChainId, getNamedAccounts } = require("hardhat");
const getTokenAddress = require("../../utils/getTokenAddress");

async function main() {
    const chainId = await getChainId();
    const accounts = await getNamedAccounts();
    const { deployer } = accounts;

    const daiBondDepositoryAddress = (await get('DaiBondDepositoryV2')).address;
    console.log(daiBondDepositoryAddress)
    const daiBondDepository = (
      await ethers.getContractFactory('contracts/DaiBondDepositoryV2.sol:DaiBondDepository')
    ).attach(daiBondDepositoryAddress);

    const daiAddress = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
    const dai = (
      await ethers.getContractFactory('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20')
    ).attach(daiAddress);

    const bondAmount = ethers.utils.parseEther('1');
    const terms = await daiBondDepository.terms();
    const minimumPrice = terms.minimumPrice;

    await dai.approve(daiBondDepositoryAddress, bondAmount);
    await daiBondDepository.deposit(bondAmount, minimumPrice, deployer);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
