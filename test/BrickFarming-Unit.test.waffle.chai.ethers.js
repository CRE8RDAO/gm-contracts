const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const { ether, gWei, wei } = require("./utils/unitUtils");
const { ZERO, MAX_UINT_256 } = require("./utils/constants");
const { getLatestBlockTimestamp } = require("./utils/helpers");
const { advanceTimeAndBlock } = require("./utils/timeUtils");

describe("BrickFarming", function () {
    let owner;
    let rewardToken;
    let stakedToken;
    let treasury;
    let farming;

    let tester1;
    let tester2;
    let tester3;

    const lockupDuration = BigNumber.from(3 * 24 * 3600); // 3 days

    before(async function () {
        const signers = await ethers.getSigners();

        owner = signers[0];
        tester1 = signers[1];
        tester2 = signers[2];
        tester3 = signers[3];
        treasury = signers[4].address;

        RewardTokenContract = await ethers.getContractFactory("MockBrickToken");
        rewardToken = await RewardTokenContract.connect(owner).deploy();

        BrickFarmingFactory = await ethers.getContractFactory("BrickFarming");
        farming = await BrickFarmingFactory.connect(owner).deploy(
            rewardToken.address,
            treasury
        );

        StakedTokenContract = await ethers.getContractFactory(
            "MockStakedToken"
        );
        stakedToken = await StakedTokenContract.connect(owner).deploy();

        // transfer lptokens to users
        await stakedToken.transfer(tester1.address, ether(50));
        await stakedToken.transfer(tester2.address, ether(50));
        await stakedToken.transfer(tester3.address, ether(50));

        // approve
        await rewardToken.approve(farming.address, MAX_UINT_256);
        await stakedToken
            .connect(tester1)
            .approve(farming.address, MAX_UINT_256);
        await stakedToken
            .connect(tester2)
            .approve(farming.address, MAX_UINT_256);
        await stakedToken
            .connect(tester3)
            .approve(farming.address, MAX_UINT_256);
    });

    describe("check initial config", function () {
        it("check rewardToken address", async function () {
            expect(await farming.rewardToken()).to.equal(rewardToken.address);
        });

        it("check treasury address", async function () {
            expect(await farming.treasury()).to.equal(treasury);
        });
    });

    describe("check owner functions", function () {
        it("check setTreasury", async () => {
            await expect(
                farming.connect(tester1).setTreasury(tester3.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
            await farming.setTreasury(tester3.address);
            expect(await farming.treasury()).to.equal(tester3.address);
            await farming.setTreasury(treasury);
        });
    });

    describe("prepare pool", function () {
        it("add pool", async () => {
            await farming.add(50, stakedToken.address, lockupDuration);

            const pool = await farming.poolInfo(0);

            expect(pool.stakedToken).to.equal(stakedToken.address);
            expect(pool.allocPoint).to.equal(50);
            expect(pool.accTokenPerShare).to.equal(ZERO);
            expect(pool.lockupDuration).to.equal(lockupDuration);
            expect(pool.totalAmount).to.equal(ZERO);
            expect(await farming.poolLength()).to.equal(1);
            expect(await farming.totalAllocPoint()).to.equal(50);
        });

        it("set pool", async () => {
            await farming.set(0, 100);

            const pool = await farming.poolInfo(0);

            expect(pool.allocPoint).to.equal(100);
            expect(await farming.totalAllocPoint()).to.equal(100);
        });
    });

    describe("Do farming", function () {
        it("Stake stakedToken on pool from tester1", async function () {
            await farming.connect(tester1).deposit(0, ether(10));
        });

        it("check poolInfo", async function () {
            const pool = await farming.poolInfo(0);

            expect(pool.accTokenPerShare).to.equal(ZERO);
            expect(pool.totalAmount).to.equal(ether(10));
        });

        it("check tester1 info for pool", async function () {
            const userInfo = await farming.userInfo(0, tester1.address);
            const blockTimeStamp = await getLatestBlockTimestamp();

            expect(userInfo.amount).to.equal(ether(10));
            expect(userInfo.rewardDebt).to.equal(ZERO);
            expect(userInfo.pendingRewards).to.equal(ZERO);
            expect(userInfo.lastClaim).to.equal(wei(blockTimeStamp));
        });

        it("check pendingReward of tester1", async () => {
            const rewards = await farming.pendingReward(0, tester1.address);
            expect(rewards).to.equal(ZERO);
        });

        it("Stake stakedToken on pool from tester2", async function () {
            await farming.connect(tester2).deposit(0, ether(10));
        });

        it("check poolInfo", async function () {
            const pool = await farming.poolInfo(0);

            expect(pool.accTokenPerShare).to.equal(ZERO);
            expect(pool.totalAmount).to.equal(ether(20));
        });

        it("check tester2 info for pool", async function () {
            const userInfo = await farming.userInfo(0, tester2.address);
            const blockTimeStamp = await getLatestBlockTimestamp();

            expect(userInfo.amount).to.equal(ether(10));
            expect(userInfo.rewardDebt).to.equal(ZERO);
            expect(userInfo.pendingRewards).to.equal(ZERO);
            expect(userInfo.lastClaim).to.equal(wei(blockTimeStamp));
        });

        it("check pendingRewards of tester2", async () => {
            const rewards = await farming.pendingReward(0, tester2.address);
            expect(rewards).to.equal(ZERO);
        });
    });

    describe("Do rewarding", function () {
        it("deposit reward", async function () {
            await farming.depositReward(gWei(10)); // 10 * 10 ^ 9
            expect(await rewardToken.balanceOf(farming.address)).to.equal(
                gWei(10)
            );
        });

        it("check poolInfo", async function () {
            const pool = await farming.poolInfo(0);

            // AllocPoint: 100%
            // Staked: 20 * 10 ^ 18
            // DepositedReward: 10 * 10 ^ 9
            // AccTokenPerShare: (10 * 10 ^ 9) * (10 ^ 12) / (20 * 10 ^ 18) = 500
            expect(pool.accTokenPerShare).to.equal(500);
        });

        it("deposit reward", async function () {
            await farming.depositReward(gWei(10)); // 10 * 10 ^ 9
            expect(await rewardToken.balanceOf(farming.address)).to.equal(
                gWei(20)
            );
        });

        it("check poolInfo", async function () {
            const pool = await farming.poolInfo(0);

            expect(pool.accTokenPerShare).to.equal(1000);
        });
    });

    describe("Do farming after deposit reward", function () {
        it("Stake stakedToken on pool from tester3 after deposit reward", async function () {
            await farming.connect(tester3).deposit(0, ether(10));
        });

        it("check farm & poolInfo", async function () {
            expect(await rewardToken.balanceOf(farming.address)).to.equal(
                gWei(20)
            );

            const pool = await farming.poolInfo(0);

            expect(pool.accTokenPerShare).to.equal(1000);
            expect(pool.totalAmount).to.equal(ether(30));
        });

        it("check tester3 info for pool", async function () {
            const userInfo = await farming.userInfo(0, tester3.address);
            const blockTimeStamp = await getLatestBlockTimestamp();

            expect(userInfo.amount).to.equal(ether(10));
            expect(userInfo.rewardDebt).to.equal(gWei(10));
            expect(userInfo.pendingRewards).to.equal(ZERO);
            expect(userInfo.lastClaim).to.equal(wei(blockTimeStamp));
        });

        it("withdraw from tester3", async function () {
            const prevBalance = await stakedToken.balanceOf(tester3.address);
            await farming.connect(tester3).withdraw(0, ether(10)); // 5% -0.5
            const afterBalance = await stakedToken.balanceOf(tester3.address);
            expect(afterBalance.sub(prevBalance)).to.equal(ether(9.5));
        });

        it("check pool after test3 withdraw", async function () {
            const pool = await farming.poolInfo(0);

            expect(pool.accTokenPerShare).to.equal(1000);
            expect(pool.totalAmount).to.equal(ether(20));
        });

        it("check treasury after test1 withdraw", async function () {
            expect(await stakedToken.balanceOf(treasury)).to.equal(ether(0.5));
        });

        it("check tester3 info", async function () {
            const userInfo = await farming.userInfo(0, tester3.address);
            const blockTimeStamp = await getLatestBlockTimestamp();

            expect(userInfo.amount).to.equal(ZERO);
            expect(userInfo.rewardDebt).to.equal(ZERO);
            expect(userInfo.pendingRewards).to.equal(ZERO);
            expect(userInfo.lastClaim).to.equal(wei(blockTimeStamp));
        });
    });

    describe("check claim", function () {
        it("claim rewards for tester1", async () => {
            await farming.connect(tester1).deposit(0, ZERO);
        });

        it("check poolInfo after tester1's claim", async function () {
            const pool = await farming.poolInfo(0);

            expect(pool.accTokenPerShare).to.equal(1000);
            expect(pool.totalAmount).to.equal(ether(20));
        });

        it("check tester1 info", async function () {
            const userInfo = await farming.userInfo(0, tester1.address);

            expect(userInfo.amount).to.equal(ether(10));
            expect(userInfo.rewardDebt).to.equal(gWei(10));
            expect(userInfo.pendingRewards).to.equal(ZERO);

            const userRewardTokenBalance = await rewardToken.balanceOf(
                tester1.address
            );

            expect(userRewardTokenBalance).to.equal(gWei(10));
        });

        it("claim rewards for tester2", async () => {
            await farming.connect(tester2).deposit(0, ZERO);
        });

        it("check poolInfo after tester2's claim", async function () {
            const pool = await farming.poolInfo(0);

            expect(pool.accTokenPerShare).to.equal(1000);
            expect(pool.totalAmount).to.equal(ether(20));
        });

        it("check tester2 info", async function () {
            const userInfo = await farming.userInfo(0, tester2.address);

            expect(userInfo.amount).to.equal(ether(10));
            expect(userInfo.rewardDebt).to.equal(gWei(10));
            expect(userInfo.pendingRewards).to.equal(ZERO);

            const userRewardTokenBalance = await rewardToken.balanceOf(
                tester2.address
            );

            expect(userRewardTokenBalance).to.equal(gWei(10));
        });
    });

    describe("check withdraw", function () {
        it("withdraw from tester1", async () => {
            const prevBalance = await stakedToken.balanceOf(tester1.address);
            await farming.connect(tester1).withdraw(0, ether(5)); // 5% -0.25
            const afterBalance = await stakedToken.balanceOf(tester1.address);
            expect(afterBalance.sub(prevBalance)).to.equal(ether(4.75));
        });

        it("check pool after test1 withdraw", async function () {
            const pool = await farming.poolInfo(0);

            expect(pool.accTokenPerShare).to.equal(1000);
            expect(pool.totalAmount).to.equal(ether(15));
        });

        it("check treasury after test1 withdraw", async function () {
            expect(await stakedToken.balanceOf(treasury)).to.equal(ether(0.75));
        });

        it("check tester1 info", async function () {
            const userInfo = await farming.userInfo(0, tester1.address);
            const blockTimeStamp = await getLatestBlockTimestamp();

            expect(userInfo.amount).to.equal(ether(5));
            expect(userInfo.rewardDebt).to.equal(gWei(5));
            expect(userInfo.pendingRewards).to.equal(ZERO);
            expect(userInfo.lastClaim).to.equal(wei(blockTimeStamp));
        });

        it("advance time to withdraw", async () => {
            await advanceTimeAndBlock(3 * 24 * 60 * 60);
        });

        it("withdraw from tester1 again", async () => {
            const prevBalance = await stakedToken.balanceOf(tester1.address);

            await farming.connect(tester1).withdraw(0, ether(5)); // 0% fee
            const afterBalance = await stakedToken.balanceOf(tester1.address);

            expect(afterBalance.sub(prevBalance)).to.equal(ether(5));
        });

        it("check pool after test1 withdraw again", async function () {
            const pool = await farming.poolInfo(0);

            expect(pool.accTokenPerShare).to.equal(1000);
            expect(pool.totalAmount).to.equal(ether(10));
        });

        it("check treasury after test1 withdraw", async function () {
            const pool = await farming.poolInfo(0);

            expect(await stakedToken.balanceOf(treasury)).to.equal(ether(0.75));
        });

        it("check tester1 info for pool0", async function () {
            const userInfo = await farming.userInfo(0, tester1.address);
            const blockTimeStamp = await getLatestBlockTimestamp();

            expect(userInfo.amount).to.equal(ZERO);
            expect(userInfo.rewardDebt).to.equal(ZERO);
            expect(userInfo.pendingRewards).to.equal(ZERO);
            expect(userInfo.lastClaim).to.equal(wei(blockTimeStamp));
        });
    });
});
