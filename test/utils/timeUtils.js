const { network } = require("hardhat");

const advanceTime = async (time) =>
    new Promise((resolve, reject) => {
        network.provider
            .send("evm_increaseTime", [time])
            .then(resolve)
            .catch(reject);
    });

const advanceBlock = () =>
    new Promise((resolve, reject) => {
        network.provider.send("evm_mine").then(resolve).catch(reject);
    });

const advanceTimeAndBlock = async (time) => {
    await advanceTime(time);
    await advanceBlock();
};

module.exports = { advanceTime, advanceBlock, advanceTimeAndBlock };
