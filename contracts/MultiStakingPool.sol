//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./LPTokenWrapper.sol";

contract MultiStakingPool is Ownable, LPTokenWrapper {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct RewardTokenInfo {
        IERC20 rewardToken;
        uint256 rewardRate;
        uint256 rewardPerTokenStored;
        uint256 rewardDistributedStored;
        uint256 startTime;
        uint256 lastUpdateTime;
        uint256 lastRateUpdateTime;
        mapping(address => uint256) userRewardPerTokenPaid;
        mapping(address => uint256) rewards;
    }

    EnumerableSet.AddressSet private rewardTokens;
    mapping(address => RewardTokenInfo) rewardTokenInfos;

    error NoRewardToken(address token);
    error RewardTokenExist(address token);

    event RewardRateUpdated(
        address token,
        uint256 oldRewardRate,
        uint256 newRewardRate
    );
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address token, address indexed user, uint256 reward);

    constructor(address _lp) {
        uni_lp = IERC20(_lp);
    }

    modifier updateReward(address _account) {
        for (uint i = 0; i < rewardTokens.length(); i++) {
            address token = rewardTokens.at(i);
            RewardTokenInfo storage rewardTokenInfo = rewardTokenInfos[token];
            rewardTokenInfo.rewardPerTokenStored = rewardPerToken(token);
            rewardTokenInfo.lastUpdateTime = block.timestamp;
            if (_account != address(0)) {
                rewardTokenInfo.rewards[_account] = earned(token, _account);
                rewardTokenInfo.userRewardPerTokenPaid[
                    _account
                ] = rewardTokenInfo.rewardPerTokenStored;
            }
        }
        _;
    }

    modifier updateRewardDistributed(address token) {
        RewardTokenInfo storage rewardTokenInfo = rewardTokenInfos[token];
        rewardTokenInfo.rewardDistributedStored = rewardDistributed(token);
        rewardTokenInfo.lastRateUpdateTime = block.timestamp;
        _;
    }

    function rewardPerToken(address token) public view returns (uint256) {
        RewardTokenInfo storage rewardTokenInfo = rewardTokenInfos[token];
        uint256 _lastTimeApplicable = Math.max(
            rewardTokenInfo.startTime,
            rewardTokenInfo.lastUpdateTime
        );

        if (totalSupply() == 0 || block.timestamp < _lastTimeApplicable) {
            return rewardTokenInfo.rewardPerTokenStored;
        }

        return
            rewardTokenInfo.rewardPerTokenStored.add(
                block
                    .timestamp
                    .sub(_lastTimeApplicable)
                    .mul(rewardTokenInfo.rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }

    function rewardDistributed(address token) public view returns (uint256) {
        // Have not started yet
        RewardTokenInfo storage rewardTokenInfo = rewardTokenInfos[token];
        if (block.timestamp < rewardTokenInfo.startTime) {
            return rewardTokenInfo.rewardDistributedStored;
        }

        return
            rewardTokenInfo.rewardDistributedStored.add(
                block
                    .timestamp
                    .sub(
                        Math.max(
                            rewardTokenInfo.startTime,
                            rewardTokenInfo.lastRateUpdateTime
                        )
                    )
                    .mul(rewardTokenInfo.rewardRate)
            );
    }

    function earned(address token, address _account)
        public
        view
        returns (uint256)
    {
        RewardTokenInfo storage rewardTokenInfo = rewardTokenInfos[token];
        return
            balanceOf(_account)
                .mul(
                    rewardPerToken(token).sub(
                        rewardTokenInfo.userRewardPerTokenPaid[_account]
                    )
                )
                .div(1e18)
                .add(rewardTokenInfo.rewards[_account]);
    }

    // stake visibility is public as overriding LPTokenWrapper's stake() function
    function stake(uint256 _amount) public override updateReward(msg.sender) {
        require(_amount > 0, "Cannot stake 0");
        super.stake(_amount);
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount)
        public
        override
        updateReward(msg.sender)
    {
        require(_amount > 0, "Cannot withdraw 0");
        super.withdraw(_amount);
        emit Withdrawn(msg.sender, _amount);
    }

    function exit() external {
        withdraw(balanceOf(msg.sender));
        getReward();
    }

    function getReward() public updateReward(msg.sender) {
        for (uint i = 0; i < rewardTokens.length(); i++) {
            address token = rewardTokens.at(i);
            RewardTokenInfo storage rewardTokenInfo = rewardTokenInfos[token];
            uint256 _reward = rewardTokenInfo.rewards[msg.sender];
            if (_reward > 0) {
                rewardTokenInfo.rewards[msg.sender] = 0;
                rewardTokenInfo.rewardToken.safeTransferFrom(
                    owner(),
                    msg.sender,
                    _reward
                );
                emit RewardPaid(token, msg.sender, _reward);
            }
        }
    }

    function setRewardRate(address token, uint256 _rewardRate)
        external
        onlyOwner
        updateRewardDistributed(token)
        updateReward(address(0))
    {
        if (!rewardTokens.contains(token)) {
            revert NoRewardToken({token: token});
        }
        RewardTokenInfo storage rewardTokenInfo = rewardTokenInfos[token];
        uint256 _oldRewardRate = rewardTokenInfo.rewardRate;
        rewardTokenInfo.rewardRate = _rewardRate;

        emit RewardRateUpdated(token, _oldRewardRate, _rewardRate);
    }

    function addRewardToken(address token, uint256 startTime)
        external
        onlyOwner
        updateReward(address(0))
    {
        if (rewardTokens.contains(token)) {
            revert RewardTokenExist({token: token});
        }
        rewardTokens.add(token);
        RewardTokenInfo storage rewardTokenInfo = rewardTokenInfos[token];
        rewardTokenInfo.rewardToken = IERC20(token);
        rewardTokenInfo.startTime = startTime;
    }

    // This function allows governance to take unsupported tokens out of the
    // contract, since this one exists longer than the other pools.
    // This is in an effort to make someone whole, should they seriously
    // mess up. There is no guarantee governance will vote to return these.
    // It also allows for removal of airdropped tokens.
    function rescueTokens(
        IERC20 _token,
        uint256 _amount,
        address _to
    ) external onlyOwner {
        // cant take staked asset
        require(_token != uni_lp, "uni_lp");

        // transfer _to
        _token.safeTransfer(_to, _amount);
    }
}
