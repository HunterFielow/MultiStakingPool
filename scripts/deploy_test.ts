import { ethers } from "hardhat";

const { BigNumber } = ethers;


const REWARD_TOKEN0_RATE = BigNumber.from("1000000");
const REWARD_TOKEN1_RATE = BigNumber.from("1000");

async function main() {

  const [deployer] = await ethers.getSigners();

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
  await multiStakingPool.addRewardToken(rewardToken1.address, Math.floor(new Date().getTime()/1000), {gasLimit: 500000});

  await multiStakingPool.setRewardRate(rewardToken1.address, REWARD_TOKEN0_RATE, {gasLimit: 500000});
  await rewardToken1.approve(multiStakingPool.address, ethers.utils.parseUnits("10000000000000000000000"), {gasLimit: 500000});

  // 添加rewardToken2
  await multiStakingPool.addRewardToken(rewardToken2.address, Math.floor(new Date().getTime()/1000), {gasLimit: 500000});
  await multiStakingPool.setRewardRate(rewardToken2.address, REWARD_TOKEN1_RATE, {gasLimit: 500000});
  await rewardToken2.approve(multiStakingPool.address, ethers.utils.parseUnits("100000000000000000000000"), {gasLimit: 500000});


  await lpToken1.approve(multiStakingPool.address, ethers.utils.parseUnits("1000000000000000"), {gasLimit: 500000});
  await multiStakingPool.stake(ethers.utils.parseUnits("1"), {gasLimit: 500000});
  await multiStakingPool.stake(ethers.utils.parseUnits("1"), {gasLimit: 500000});
  const token1 = await multiStakingPool.getRewardByToken(deployer.address, rewardToken1.address);
  const token2 = await multiStakingPool.getRewardByToken(deployer.address, rewardToken2.address);
  console.log(`get reward, token1: ${token1}, token2: ${token2}`)
  await multiStakingPool.getReward({gasLimit: 500000});
  const mtoken1 = await rewardToken1.balanceOf(deployer.address);
  const mtoken2 = await rewardToken2.balanceOf(deployer.address);
  console.log(`total reward, token1: ${mtoken1}, token2: ${mtoken2}`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
