import { ethers } from "hardhat";

const { BigNumber } = ethers;

// DF/USX的LP DF/USDC的LP
/**
 * 
USDC：0x11513151a77fE2Bc43fdEdeACE05c4F35ff81A8f
USDT：0x95F46c202e3816e287E849DFa025C0b070ae7210
USX：0x9778dde08ec20418dc735a94805c20f5e2e7e51e
DAI：0x49ad4e09Ed76080d0480F4F371f8F8e64D61aB1E
WBTC：0x2cdDE765102AD11F510501E255926e1Bc68bdda5
UNI：0xCA52Cd43c271d2e30bd071A26465Ec433FBf6d9b
DF：0x79E40d67DA6eAE5eB4A93Fc6a56A7961625E15F3
GOLDx：0x89415542C7290e716043B670f85BA5d45F1e8858
DF_USX_LP:0xCAF9DF60afF11e435421B2e3DdAB6BeAe3077e76
DF_USDC_LP:0xB7f3F46061a6d84FA20E7E5cCc7EE27eC379cf55
 */
const LP_TOKEN = "0xCAF9DF60afF11e435421B2e3DdAB6BeAe3077e76"; // DF_USX_LP
const REWARD_TOKEN0 = "0x79E40d67DA6eAE5eB4A93Fc6a56A7961625E15F3"; //DF
const REWARD_TOKEN0_RATE = BigNumber.from("10000000000");
const REWARD_TOKEN1 = "0x11513151a77fE2Bc43fdEdeACE05c4F35ff81A8f";  // USDC
const REWARD_TOKEN1_RATE = BigNumber.from("20000000000");

async function main() {
  const MultiStakingPool = await ethers.getContractFactory("MultiStakingPool");
  const multiStakingPool = await MultiStakingPool.deploy(LP_TOKEN);

  await multiStakingPool.deployed();

  console.log("Contract deployed to:", multiStakingPool.address);

  // 添加rewardToken1
  multiStakingPool.addRewardToken(REWARD_TOKEN0, new Date().getTime());
  multiStakingPool.setRewardRate(REWARD_TOKEN0, REWARD_TOKEN0_RATE);

  // 添加rewardToken2
  multiStakingPool.addRewardToken(REWARD_TOKEN1, new Date().getTime());
  multiStakingPool.setRewardRate(REWARD_TOKEN1, REWARD_TOKEN1_RATE);
  // 修改rewardToken rate

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
