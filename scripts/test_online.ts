import { ethers } from "hardhat";

const { BigNumber } = ethers;

const REWARD_TOKEN0_RATE = 1000000;
const REWARD_TOKEN1_RATE = 1000;

async function main() {

  const [deployer] = await ethers.getSigners();

  // LPToken
  const lpToken1 = await ethers.getContractAt("LPToken1", "0x6d53d82dbc80b4abe65ef0f2d8748818bd0ef172");

  // RewardToken1
  const rewardToken1 = await ethers.getContractAt("RewardToken1", "0x0fbe89116825640edab7a70ee5c6591c7f82e60f");

  // RewardToken2
  const rewardToken2 = await ethers.getContractAt("RewardToken2", "0xfc44921abd0e5187a8c76b5dae1508aada39b69e");

  // MultiStakingPool
  const multiStakingPool = await ethers.getContractAt("MultiStakingPool", "0xdb1d52287893ccfcbaa97b0548495c5f65ba43a8");


  // 添加rewardToken1
 // await multiStakingPool.addRewardToken(rewardToken1.address, new Date().getTime());
 // await multiStakingPool.setRewardRate(rewardToken1.address, REWARD_TOKEN0_RATE);

 // await rewardToken1.approve(multiStakingPool.address, ethers.utils.parseUnits("10000000000000000000000"));

  // 添加rewardToken2
 // await multiStakingPool.addRewardToken(rewardToken2.address, new Date().getTime());
  //await multiStakingPool.setRewardRate(rewardToken2.address, REWARD_TOKEN1_RATE);
  //await rewardToken2.approve(multiStakingPool.address, ethers.utils.parseUnits("100000000000000000000000"));


 // await lpToken1.approve(multiStakingPool.address, ethers.utils.parseUnits("1000000000000000"));
  await multiStakingPool.stake(ethers.utils.parseEther("0.01"), { gasLimit: 500000});
  await multiStakingPool.stake(ethers.utils.parseEther("0.01"), { gasLimit: 500000});
  const mToken1 = await multiStakingPool.getRewardByToken(deployer.address, rewardToken1.address);
  const mToken2 = await multiStakingPool.getRewardByToken(deployer.address, rewardToken2.address);
  console.log(`my reward token, token1: ${mToken1}, token2: ${mToken2}`)

  /** 
  await multiStakingPool.getReward();
  const token1 = await rewardToken1.balanceOf(deployer.address);
  const token2 = await rewardToken2.balanceOf(deployer.address);
  console.log(`get reward, token1: ${token1}, token2: ${token2}`)
  */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
