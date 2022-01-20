// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BrickFarming is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 pendingRewards;
        uint256 lastClaim;
    }

    struct PoolInfo {
        IERC20 stakedToken;
        uint256 allocPoint;
        uint256 accTokenPerShare;
        uint256 lockupDuration;
        uint256 totalAmount;
    }

    IERC20 public rewardToken;

    PoolInfo[] public poolInfo;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    uint256 public totalAllocPoint;

    mapping(address => bool) private isPoolAdded;

    // 5% fee when users withdraw within 3 days
    uint256 public emergencyWithdrawFee = 500;
    uint256 public constant FEE_MULTIPLIER = 10000;
    // fee container
    address public treasury;

    uint256 public constant SHARE_MULTIPLIER = 1e12;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Claim(address indexed user, uint256 indexed pid, uint256 amount);
    event PoolAdded(
        uint256 indexed index,
        address indexed stakedToken,
        uint256 allocPoint,
        uint256 lockupDuration
    );
    event PoolUpdated(uint256 indexed index, uint256 allocPoint);
    event TreasuryUpdated(address indexed treasury);
    event EmergencyWithdrawFeeUpdated(uint256 emergencyWithdrawFee);
    event Pause();
    event Unpause();

    constructor(IERC20 _rewardToken, address _treasury) {
        require(
            address(_rewardToken) != address(0),
            "BrickFarm: Invalid rewardToken address"
        );
        require(
            address(_treasury) != address(0),
            "BrickFarm: Invalid treasury address"
        );

        rewardToken = _rewardToken;
        treasury = _treasury;

        emit TreasuryUpdated(_treasury);
        emit EmergencyWithdrawFeeUpdated(emergencyWithdrawFee);
    }

    modifier validatePoolByPid(uint256 _pid) {
        require(_pid < poolInfo.length, "BrickFarm: Pool does not exist");
        _;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    function pendingReward(uint256 _pid, address _user)
        public
        view
        validatePoolByPid(_pid)
        returns (uint256)
    {
        require(_user != address(0), "BrickFarm: Invalid address");

        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];

        return
            user
                .amount
                .mul(pool.accTokenPerShare)
                .div(SHARE_MULTIPLIER)
                .add(user.pendingRewards)
                .sub(user.rewardDebt);
    }

    function deposit(uint256 _pid, uint256 _amount)
        external
        nonReentrant
        whenNotPaused
        validatePoolByPid(_pid)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        uint256 pendingRewards = pendingReward(_pid, msg.sender);
        if (pendingRewards > 0) {
            uint256 sentRewards = safeTokenTransfer(msg.sender, pendingRewards);
            emit Claim(msg.sender, _pid, sentRewards);
            user.pendingRewards = pendingRewards.sub(sentRewards);
        }

        if (_amount > 0) {
            pool.stakedToken.safeTransferFrom(
                address(msg.sender),
                address(this),
                _amount
            );

            user.amount = user.amount.add(_amount);
            user.lastClaim = block.timestamp;
        }

        user.rewardDebt = user.amount.mul(pool.accTokenPerShare).div(
            SHARE_MULTIPLIER
        );
        pool.totalAmount = pool.totalAmount.add(_amount);

        emit Deposit(msg.sender, _pid, _amount);
    }

    function withdraw(uint256 _pid, uint256 _amount)
        external
        nonReentrant
        whenNotPaused
        validatePoolByPid(_pid)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        require(user.amount >= _amount, "BrickFarm: Invalid withdraw amount");

        uint256 feeAmount;
        if (block.timestamp < user.lastClaim.add(pool.lockupDuration)) {
            feeAmount = _amount.mul(emergencyWithdrawFee).div(FEE_MULTIPLIER);
        }

        uint256 pendingRewards = pendingReward(_pid, msg.sender);
        if (pendingRewards > 0) {
            uint256 sentRewards = safeTokenTransfer(msg.sender, pendingRewards);
            emit Claim(msg.sender, _pid, sentRewards);
            user.pendingRewards = pendingRewards.sub(sentRewards);
        }

        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            user.lastClaim = block.timestamp;

            pool.stakedToken.safeTransfer(
                address(msg.sender),
                _amount.sub(feeAmount)
            );

            if (feeAmount > 0) {
                pool.stakedToken.safeTransfer(treasury, feeAmount);
            }
        }

        user.rewardDebt = user.amount.mul(pool.accTokenPerShare).div(
            SHARE_MULTIPLIER
        );
        pool.totalAmount = pool.totalAmount.sub(_amount);

        emit Withdraw(msg.sender, _pid, _amount);
    }

    function safeTokenTransfer(address _to, uint256 _amount)
        internal
        returns (uint256)
    {
        uint256 rewardTokenBal = rewardToken.balanceOf(address(this));
        if (_amount > rewardTokenBal) {
            rewardToken.safeTransfer(_to, rewardTokenBal);
            return rewardTokenBal;
        } else {
            rewardToken.safeTransfer(_to, _amount);
            return _amount;
        }
    }

    function depositReward(uint256 _amount) external {
        require(_amount > 0, "BrickFarm: Invalid amount");

        rewardToken.safeTransferFrom(msg.sender, address(this), _amount);

        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            PoolInfo storage pool = poolInfo[pid];

            pool.accTokenPerShare = pool.accTokenPerShare.add(
                _amount.mul(pool.allocPoint).mul(SHARE_MULTIPLIER).div(
                    totalAllocPoint.mul(pool.totalAmount)
                )
            );
        }
    }

    function add(
        uint256 _allocPoint,
        IERC20 _stakedToken,
        uint256 _lockupDuration
    ) external onlyOwner {
        require(
            !isPoolAdded[address(_stakedToken)],
            "BrickFarm: There's already a pool with that token!"
        );
        require(_lockupDuration > 0, "BrickFarm: Invalid lockupDuration");

        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                stakedToken: _stakedToken,
                allocPoint: _allocPoint,
                accTokenPerShare: 0,
                lockupDuration: _lockupDuration,
                totalAmount: 0
            })
        );

        isPoolAdded[address(_stakedToken)] = true;

        emit PoolAdded(
            poolInfo.length - 1,
            address(_stakedToken),
            _allocPoint,
            _lockupDuration
        );
    }

    function set(uint256 _pid, uint256 _allocPoint)
        external
        onlyOwner
        validatePoolByPid(_pid)
    {
        totalAllocPoint = totalAllocPoint.add(_allocPoint).sub(
            poolInfo[_pid].allocPoint
        );
        poolInfo[_pid].allocPoint = _allocPoint;

        emit PoolUpdated(_pid, _allocPoint);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(
            address(_treasury) != address(0),
            "BrickFarm: Invalid treasury address"
        );

        treasury = _treasury;

        TreasuryUpdated(_treasury);
    }

    function setEmergencyWithdrawFee(uint256 _emergencyWithdrawFee)
        external
        onlyOwner
    {
        require(
            _emergencyWithdrawFee <= 1000,
            "BrickFarm: Fee's upper limit is 10%"
        );

        emergencyWithdrawFee = _emergencyWithdrawFee;

        emit EmergencyWithdrawFeeUpdated(_emergencyWithdrawFee);
    }

    function pause() external onlyOwner whenNotPaused {
        _pause();
        emit Pause();
    }

    function unpause() external onlyOwner whenPaused {
        _unpause();
        emit Unpause();
    }
}
