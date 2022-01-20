const { ethers, network } = require("hardhat");

const unlockAccount = async (address) => {
    await network.provider.send("hardhat_impersonateAccount", [address]);
    return address;
};

const increaseTime = async (sec) => {
    await network.provider.send("evm_increaseTime", [sec]);
    await network.provider.send("evm_mine");
};

const mineBlocks = async (blockCount) => {
    for (let i = 0; i < blockCount; ++i) {
        await network.provider.send("evm_mine");
    }
};

const getBlockNumber = async () => {
    const blockNumber = await network.provider.send("eth_blockNumber");
    return parseInt(blockNumber.slice(2), 16);
};

const getTimeStamp = async () => {
    const blockNumber = await network.provider.send("eth_blockNumber");
    const blockTimestamp = (
        await network.provider.send("eth_getBlockByNumber", [
            blockNumber,
            false,
        ])
    ).timestamp;
    return parseInt(blockTimestamp.slice(2), 16);
};

const getSnapShot = async () => {
    return await network.provider.send("evm_snapshot");
};

const revertEvm = async (snapshotID) => {
    await network.provider.send("evm_revert", [snapshotID]);
};

const getLatestBlockTimestamp = async () => {
    const latestBlock = await ethers.provider.getBlock("latest");
    return latestBlock.timestamp;
};

const getLatestBlockNumber = async () => {
    const latestBlock = await ethers.provider.getBlock("latest");
    return latestBlock.number;
};

module.exports = {
    unlockAccount,
    increaseTime,
    mineBlocks,
    getBlockNumber,
    getTimeStamp,
    getSnapShot,
    revertEvm,
    getLatestBlockTimestamp,
    getLatestBlockNumber,
};
