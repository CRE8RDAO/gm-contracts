import { expect } from "chai";
import { ethers } from "hardhat";

let owner: any;
let account1: any;
let brickFarming: any;
let cre8rTokenContract: any;
let brickTokenContract: any;

describe("BrickFarming", function () {
  beforeEach(async () => {
    [owner, account1] = await ethers.getSigners();
    // console.debug("owner, account1", owner, account1);

    // Brick Token
    const BrickToken = await ethers.getContractFactory("Erc20Token");
    const brickToken = await BrickToken.deploy(
      "Brick Token", // name
      "BRICK", // symbol
      1000000000 // initialSupply
    );
    brickTokenContract = await brickToken.deployed();

    // CRE8R Token
    const CRE8R = await ethers.getContractFactory("Erc20Token");
    const cre8r = await CRE8R.deploy(
      "CRE8R Token", // name
      "CRE8R", // symbol
      1000000000 // initialSupply
    );
    cre8rTokenContract = await cre8r.deployed();

    const BrickFarming = await ethers.getContractFactory("BrickFarming");
    brickFarming = await BrickFarming.deploy(brickTokenContract.address);
    // console.debug("brickFarming", brickFarming);
    await brickFarming.deployed();
  });

  describe("Initial settings", function () {
    it("Should return the same Brick Token address after deployed", async function () {
      expect(await brickFarming.Brick()).to.equal(brickTokenContract.address);
    });

    it("Should return 0 poolInfo.length", async function () {
      expect(await brickFarming.poolLength()).to.equal(0);
    });

    it("Should return 0 totalAllocPoint", async function () {
      expect(await brickFarming.totalAllocPoint()).to.equal(0);
    });

    it("Should return a multiplier of 1e12", async function () {
      expect(await brickFarming.multiplier()).to.equal(1e12);
    });
  });

  describe("Token pool", function () {
    beforeEach(async () => {
      // add CRE8R token pool
      const addPoolTx = await brickFarming.add(
        1000, // _allocPoint
        cre8rTokenContract.address, // _stakingToken
        false // _withUpdate
      );
      // wait until the transaction is mined
      await addPoolTx.wait();
    });

    it("Should return pool.length of 1 when first added", async function () {
      expect(await brickFarming.poolLength()).to.equal(1);
    });

    it("Should return corret poolInfo when first added", async function () {
      const poolInfo = await brickFarming.poolInfo(0);

      expect(poolInfo.stakingToken).to.equal(cre8rTokenContract.address);
      expect(poolInfo.stakingTokenTotalAmount).to.equal(0);
      expect(poolInfo.allocPoint).to.equal(1000);
      expect(poolInfo.accBrickPerShare).to.equal(0);
    });

    it("Should throw VM exception of `ERC20: transfer amount exceeds allowance` if not approved", async function () {
      try {
        const stakeTokenTx = await brickFarming.deposit(
          0, // _pid
          10000 // _amount
        );
        await stakeTokenTx.wait();
      } catch (e: any) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with reason string 'ERC20: transfer amount exceeds allowance'"
        );
      }
    });

    it("Should return corret poolInfo and userInfo when first staked", async function () {
      const cre8rApproveTx = await cre8rTokenContract.approve(
        brickFarming.address, // _tokenAddress
        10000000 // _amount
      );
      await cre8rApproveTx.wait();

      const stakeTokenTx = await brickFarming.deposit(
        0, // _pid
        10000 // _amount
      );
      await stakeTokenTx.wait();

      const poolInfo = await brickFarming.poolInfo(0);
      const userInfo = await brickFarming.userInfo(0, owner.address);

      // poolInfo
      expect(poolInfo.stakingTokenTotalAmount).to.equal(10000);
      expect(poolInfo.accBrickPerShare).to.equal(0);

      // userInfo
      expect(userInfo.amount).to.equal(10000);
      expect(userInfo.rewardDebt).to.equal(0); // return 0 if pool.accBrickPerShare = 0;
      expect(userInfo.remainingBrickTokenReward).to.equal(0); // return 0 if first time stake;
    });

    it("Should return corret poolInfo and userInfo after second stakes", async function () {
      const cre8rApproveTx = await cre8rTokenContract.approve(
        brickFarming.address, // _tokenAddress
        10000000 // _amount
      );
      await cre8rApproveTx.wait();

      // first stake
      const firstStakeTxn = await brickFarming.deposit(
        0, // _pid
        10000 // _amount
      );
      await firstStakeTxn.wait();

      // second stake
      const secondStakeTxn = await brickFarming.deposit(
        0, // _pid
        20000 // _amount
      );
      await secondStakeTxn.wait();

      const poolInfo = await brickFarming.poolInfo(0);
      const userInfo = await brickFarming.userInfo(0, owner.address);

      // poolInfo
      expect(poolInfo.stakingTokenTotalAmount).to.equal(30000);
      expect(poolInfo.accBrickPerShare).to.equal(0);

      // userInfo
      expect(userInfo.amount).to.equal(30000);
      expect(userInfo.rewardDebt).to.equal(0); // return 0 if pool.accBrickPerShare = 0;
      expect(userInfo.remainingBrickTokenReward).to.equal(0); // return 0 if first time stake;
    });

    it("Should fail to set pool.accBrickPerShare if no staking in the token pool", async function () {
      try {
        // set PoolInfo
        const setPoolInfoTxn = await brickFarming.set(
          0, // _pid
          10000, // _allocPoint
          10, // _brickPerShare
          false // _withUpdate
        );
        await setPoolInfoTxn.wait();
      } catch (e: any) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: reverted with panic code 0x12 (Division or modulo division by zero)"
        );
      }
    });

    it("Should set pool.accBrickPerShare successfully", async function () {
      // approve token transfer
      const cre8rApproveTx = await cre8rTokenContract.approve(
        brickFarming.address, // _tokenAddress
        10000000 // _amount
      );
      await cre8rApproveTx.wait();

      // stake token
      const stakeTokenTx = await brickFarming.deposit(
        0, // _pid
        10000 // _amount
      );
      await stakeTokenTx.wait();

      // set PoolInfo
      const setPoolInfoTxn = await brickFarming.set(
        0, // _pid
        10000, // _allocPoint
        10, // _brickPerShare
        false // _withUpdate
      );
      await setPoolInfoTxn.wait();

      const poolInfo = await brickFarming.poolInfo(0);
      const userInfo = await brickFarming.userInfo(0, owner.address);

      // poolInfo
      const accBrickPerShare =
        (10 * 1 * (await brickFarming.multiplier())) / 10000; // accBrickPerShare = _brickPerShare * poolRatio * multiplier / pool.stakingTokenTotalAmount
      expect(poolInfo.stakingTokenTotalAmount).to.equal(10000);
      expect(poolInfo.accBrickPerShare).to.equal(accBrickPerShare);

      // userInfo
      expect(userInfo.amount).to.equal(10000);
      expect(userInfo.rewardDebt).to.equal(0); // return 0 if first time stake;
      expect(userInfo.remainingBrickTokenReward).to.equal(0); // return 0 if first time stake;
    });

    it("Should return positive remainingBrickTokenReward if accBrickPerShare > 0 && the pool does not have enough Brick", async function () {
      // approve token transfer
      const cre8rApproveTx = await cre8rTokenContract.approve(
        brickFarming.address, // _tokenAddress
        10000000 // _amount
      );
      await cre8rApproveTx.wait();

      // stake token
      const stakeTokenTx = await brickFarming.deposit(
        0, // _pid
        10000 // _amount
      );
      await stakeTokenTx.wait();

      // set PoolInfo
      const setPoolInfoTxn = await brickFarming.set(
        0, // _pid
        10000, // _allocPoint
        10, // _brickPerShare
        false // _withUpdate
      );
      await setPoolInfoTxn.wait();

      // stake token again
      const stakeTokenAgainTx = await brickFarming.deposit(
        0, // _pid
        20000 // _amount
      );
      await stakeTokenAgainTx.wait();

      // userInfo
      const userInfo = await brickFarming.userInfo(0, owner.address);
      expect(userInfo.amount).to.equal(30000);
      expect(userInfo.rewardDebt).to.equal(30); // user.rewardDebt = user.amount * pool.accBrickPerShare / multiplier;
      // TODO
      expect(userInfo.remainingBrickTokenReward).to.equal(10); // user.remainingBrickTokenReward = user.amount * pool.accBrickPerShare / multiplier - user.rewardDebt + user.remainingBrickTokenReward;
    });

    it("Should return 0 remainingBrickTokenReward if accBrickPerShare > 0 && the pool does have enough Brick", async function () {
      // approve token transfer
      const cre8rApproveTx = await cre8rTokenContract.approve(
        brickFarming.address, // _tokenAddress
        10000000 // _amount
      );
      await cre8rApproveTx.wait();

      // stake token
      const stakeTokenTx = await brickFarming.deposit(
        0, // _pid
        10000 // _amount
      );
      await stakeTokenTx.wait();

      // set PoolInfo
      const setPoolInfoTxn = await brickFarming.set(
        0, // _pid
        10000, // _allocPoint
        10, // _brickPerShare
        false // _withUpdate
      );
      await setPoolInfoTxn.wait();

      // Transfer BRICK token to this contract
      const transferBrickTx = await brickTokenContract.transfer(
        brickFarming.address, // _tokenAddress
        10000000 // _amount
      );
      await transferBrickTx.wait();

      // stake token again
      const stakeTokenAgainTx = await brickFarming.deposit(
        0, // _pid
        20000 // _amount
      );
      await stakeTokenAgainTx.wait();

      // userInfo
      const userInfo = await brickFarming.userInfo(0, owner.address);
      expect(userInfo.amount).to.equal(30000);
      expect(userInfo.rewardDebt).to.equal(30); // user.rewardDebt = user.amount * pool.accBrickPerShare / multiplier;
      // TODO
      expect(userInfo.remainingBrickTokenReward).to.equal(0); // user.remainingBrickTokenReward = user.amount * pool.accBrickPerShare / multiplier - user.rewardDebt + user.remainingBrickTokenReward;
    });

    it("Should return positive Brick balance if accBrickPerShare > 0 && the pool does have enough Brick", async function () {
      // Transfer BRICK token to account1
      const transferCre8rTx = await cre8rTokenContract.transfer(
        account1.address, // _tokenAddress
        10000000 // _amount
      );
      await transferCre8rTx.wait();

      // approve cre8r token transfer for account1
      const cre8rApproveAcc1Tx = await cre8rTokenContract
        .connect(account1)
        .approve(
          brickFarming.address, // _tokenAddress
          10000000 // _amount
        );
      await cre8rApproveAcc1Tx.wait();

      // account1 stake token
      const stakeTokenTx = await brickFarming.connect(account1).deposit(
        0, // _pid
        10000 // _amount
      );
      await stakeTokenTx.wait();

      // set PoolInfo
      const setPoolInfoTxn = await brickFarming.set(
        0, // _pid
        10000, // _allocPoint
        10, // _brickPerShare
        false // _withUpdate
      );
      await setPoolInfoTxn.wait();

      // Transfer BRICK token from Owner to this contract
      const transferBrickTx = await brickTokenContract.transfer(
        brickFarming.address, // _tokenAddress
        10000000 // _amount
      );
      await transferBrickTx.wait();

      // stake token again
      const stakeTokenAgainTx = await brickFarming.connect(account1).deposit(
        0, // _pid
        20000 // _amount
      );
      await stakeTokenAgainTx.wait();

      // userInfo
      const userInfo = await brickFarming.userInfo(0, account1.address);
      expect(userInfo.amount).to.equal(30000);
      expect(userInfo.rewardDebt).to.equal(30); // user.rewardDebt = user.amount * pool.accBrickPerShare / multiplier;

      // BRICK token in user address
      const balanceOfAccount1Txn = await brickTokenContract.balanceOf(
        account1.address // _address
      );
      // TODO
      expect(balanceOfAccount1Txn).to.equal(10);
    });

    describe("Withdrawal", function () {
      beforeEach(async () => {
        // Transfer BRICK token from Owner to this contract
        const transferBrickTx = await brickTokenContract.transfer(
          brickFarming.address, // _tokenAddress
          10000000 // _amount
        );
        await transferBrickTx.wait();

        // approve token transfer
        const cre8rApproveTx = await cre8rTokenContract.approve(
          brickFarming.address, // _tokenAddress
          10000000 // _amount
        );
        await cre8rApproveTx.wait();

        // stake token
        const stakeTokenTx = await brickFarming.deposit(
          0, // _pid
          10000 // _amount
        );
        await stakeTokenTx.wait();

        // set PoolInfo
        const setPoolInfoTxn = await brickFarming.set(
          0, // _pid
          10000, // _allocPoint
          10, // _brickPerShare
          false // _withUpdate
        );
        await setPoolInfoTxn.wait();

        // stake token again
        const stakeTokenAgainTx = await brickFarming.deposit(
          0, // _pid
          20000 // _amount
        );
        await stakeTokenAgainTx.wait();
      });

      it("Should withdraw successfully if user.amount >= _amount", async function () {
        // userInfo
        const userInfo = await brickFarming.userInfo(0, owner.address);
        expect(userInfo.amount).to.equal(30000);

        // withdraw txn
        const withdrawTx = await brickFarming.withdraw(
          0, // _pid
          20000 // _amount
        );
        await withdrawTx.wait();

        const latestUserInfo = await brickFarming.userInfo(0, owner.address);
        expect(latestUserInfo.amount).to.equal(10000);
      });

      it("Should throw VM exception of `Brick: Brick: you have not enough brick` if _amount > user.amount", async function () {
        try {
          const withdrawTx = await brickFarming.withdraw(
            0, // _pid
            40000 // _amount
          );
          await withdrawTx.wait();
        } catch (e: any) {
          expect(e.message).to.equal(
            "VM Exception while processing transaction: reverted with reason string 'Brick: you have not enough brick'"
          );
        }
      });

      it("Should transfer back CRE8R token successfully after withdrawl", async function () {
        // CRE8R token in owner address
        const balanceOfCre8r = await cre8rTokenContract.balanceOf(
          owner.address // _address
        );

        // withdraw txn
        const withdrawTx = await brickFarming.withdraw(
          0, // _pid
          20000 // _amount
        );
        await withdrawTx.wait();

        // Latest CRE8R token in owner address after withdrawl
        const latestBalanceOfCre8r = await cre8rTokenContract.balanceOf(
          owner.address // _address
        );
        const balance = balanceOfCre8r.add(20000);
        expect(latestBalanceOfCre8r).to.equal(balance);
      });

      it("Should receive no extra BRICK token reward after withdrawl if no additional accBrickPerShare", async function () {
        // BRICK token in owner address
        const balanceOfBrick = await brickTokenContract.balanceOf(
          owner.address // _address
        );

        // withdraw txn
        const withdrawTx = await brickFarming.withdraw(
          0, // _pid
          20000 // _amount
        );
        await withdrawTx.wait();

        // BRICK token in owner address
        const latestBalanceOfBrick = await brickTokenContract.balanceOf(
          owner.address // _address
        );
        const reward = latestBalanceOfBrick - balanceOfBrick;
        expect(reward).to.equal(0);
      });

      it("Should receive BRICK token reward after withdrawl if addtional accBrickPerShare is added", async function () {
        // BRICK token in owner address
        const balanceOfBrick = await brickTokenContract.balanceOf(
          owner.address // _address
        );

        // set PoolInfo
        const setPoolInfoTxn = await brickFarming.set(
          0, // _pid
          10000, // _allocPoint
          30, // _brickPerShare
          false // _withUpdate
        );
        await setPoolInfoTxn.wait();

        const userInfo = await brickFarming.userInfo(0, owner.address);
        const poolInfo = await brickFarming.poolInfo(0);
        const multiplier = await brickFarming.multiplier();

        const reward = userInfo.amount
          .mul(poolInfo.accBrickPerShare)
          .div(multiplier)
          .sub(userInfo.rewardDebt)
          .add(userInfo.remainingBrickTokenReward); // user.amount * pool.accBrickPerShare / multiplier - user.rewardDebt + user.remainingBrickTokenReward;

        // withdraw txn
        const withdrawTx = await brickFarming.withdraw(
          0, // _pid
          20000 // _amount
        );
        await withdrawTx.wait();

        // Latest BRICK token in owner address
        const latestBalanceOfBrick = await brickTokenContract.balanceOf(
          owner.address // _address
        );

        expect(latestBalanceOfBrick - balanceOfBrick).to.equal(reward);
      });

      it("Should receive BRICK token reward after withdrawl if addtional accBrickPerShare is added", async function () {
        // BRICK token in owner address
        const balanceOfBrick = await brickTokenContract.balanceOf(
          owner.address // _address
        );

        // set PoolInfo
        const setPoolInfoTxn = await brickFarming.set(
          0, // _pid
          10000, // _allocPoint
          30, // _brickPerShare
          false // _withUpdate
        );
        await setPoolInfoTxn.wait();

        const userInfo = await brickFarming.userInfo(0, owner.address);
        const poolInfo = await brickFarming.poolInfo(0);
        const multiplier = await brickFarming.multiplier();

        const reward = userInfo.amount
          .mul(poolInfo.accBrickPerShare)
          .div(multiplier)
          .sub(userInfo.rewardDebt)
          .add(userInfo.remainingBrickTokenReward); // user.amount * pool.accBrickPerShare / multiplier - user.rewardDebt + user.remainingBrickTokenReward;

        // withdraw txn
        const withdrawTx = await brickFarming.withdraw(
          0, // _pid
          20000 // _amount
        );
        await withdrawTx.wait();

        // Latest BRICK token in owner address
        const latestBalanceOfBrick = await brickTokenContract.balanceOf(
          owner.address // _address
        );

        expect(latestBalanceOfBrick - balanceOfBrick).to.equal(reward);
      });

      it("Should userInfo.amount = 0 after emergencyWithdraw", async function () {
        // userInfo before emergencyWithdraw
        const userInfo = await brickFarming.userInfo(0, owner.address);
        const hasAmount = userInfo.amount.gt(0);
        // eslint-disable-next-line no-unused-expressions
        expect(hasAmount).to.be.true;

        // withdraw txn
        const withdrawTx = await brickFarming.emergencyWithdraw(
          0 // _pid
        );
        await withdrawTx.wait();

        // userInfo after emergencyWithdraw
        const latestUserInfo = await brickFarming.userInfo(0, owner.address);

        expect(latestUserInfo.amount).to.equal(0);
      });

      it("Should transfer back all staked token to wallet after emergencyWithdraw", async function () {
        // BRICK token in owner address
        const balanceOfCre8r = await cre8rTokenContract.balanceOf(
          owner.address // _address
        );
        const userInfo = await brickFarming.userInfo(0, owner.address);

        // withdraw txn
        const withdrawTx = await brickFarming.emergencyWithdraw(
          0 // _pid
        );
        await withdrawTx.wait();

        // Latest BRICK token in owner address
        const latestBalanceOfCre8r = await cre8rTokenContract.balanceOf(
          owner.address // _address
        );

        expect(latestBalanceOfCre8r - balanceOfCre8r).to.equal(userInfo.amount);
      });
    });
  });
});
