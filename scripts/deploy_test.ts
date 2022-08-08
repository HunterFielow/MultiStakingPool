import { ethers } from "hardhat";

const { BigNumber } = ethers;


const REWARD_TOKEN0_RATE = BigNumber.from("10000000000");
const REWARD_TOKEN1_RATE = BigNumber.from("20000000000");

async function main() {
  // LPToken
  const LPToken1 = await ethers.getContractFactory("LPToken1");
  const lpToken1 = await LPToken1.deploy();
  await lpToken1.deployed();
  console.log("LPToken1 deployed to:", lpToken1.address);

  // RewardToken1
  const RewardToken1 = await ethers.getContractFactory("RewardToken1");
  const rewardToken1 = await RewardToken1.deploy();
  await rewardToken1.deployed();
  console.log("RewardToken1 deployed to:", rewardToken1.address);

  // RewardToken2
  const RewardToken2 = await ethers.getContractFactory("RewardToken2");
  const rewardToken2 = await RewardToken2.deploy();
  await rewardToken2.deployed();
  console.log("RewardToken2 deployed to:", rewardToken2.address);

  const MultiStakingPool = await ethers.getContractFactory("MultiStakingPool");
  const multiStakingPool = await MultiStakingPool.deploy(lpToken1.address);

  await multiStakingPool.deployed();

  console.log("Contract deployed to:", multiStakingPool.address);

  // 添加rewardToken1
  multiStakingPool.addRewardToken(rewardToken1.address, new Date().getTime());
  multiStakingPool.setRewardRate(rewardToken1.address, REWARD_TOKEN0_RATE);

  // 添加rewardToken2
  multiStakingPool.addRewardToken(rewardToken2.address, new Date().getTime());
  multiStakingPool.setRewardRate(rewardToken2.address, REWARD_TOKEN1_RATE);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
