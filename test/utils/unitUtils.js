const { ethers } = require("ethers");
const { BigNumber } = ethers;

const ether = (amount) => {
    const weiString = ethers.utils.parseEther(amount.toString());
    return BigNumber.from(weiString);
};

const wei = (amount) => {
    const weiString = ethers.utils.parseUnits(amount.toString(), 0);
    return BigNumber.from(weiString);
};

const gWei = (amount) => {
    const weiString = ethers.utils.parseUnits(amount.toString(), 9);
    return BigNumber.from(weiString);
};

const usdc = (amount) => {
    const weiString = ethers.utils.parseUnits(amount.toString(), 6);
    return BigNumber.from(weiString);
};

module.exports = {
    ether,
    wei,
    gWei,
    usdc,
};
