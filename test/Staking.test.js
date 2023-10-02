const { expect } = require('chai');
const { ethers, UniswapV2Deployer } = require("hardhat");
const { moveTime } = require("../utils/move-time")

const SECONDS_IN_A_DAY = 86400

let deployer, owner, user1, user2
let TokenName, tokenName, Staking, staking, stakeAmount

function eth(amount) {
    return ethers.utils.parseEther(amount.toString())
}

describe("Setter Functions Tests", async function () {
    beforeEach(async function () {
        [deployer, owner, user1, user2] = await ethers.getSigners();

        // deploy the uniswap v2 protocol
        const deploymentResult = await UniswapV2Deployer.deploy(owner);
        router = deploymentResult.router;

        // Deploy the Token contract as a proxy
        TokenName = await ethers.getContractFactory("TokenName");
        tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);

        // Deploy the Staking contract
        Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(tokenName.address, owner.address);
    })

    it("Should change aprNinety", async function () {
        // should revert if not owner
        await expect(staking.connect(user1).setAprNinetyDays(100)).to.be.revertedWith("Ownable: caller is not the owner")

        expect(await staking.aprNinety()).to.equal(400)

        // should revert with InvalidApr if 0
        await expect(staking.connect(owner).setAprNinetyDays(0)).to.be.revertedWith("InvalidApr")

        // should revert with AprAlreadySet
        await staking.connect(owner).setAprNinetyDays(100)
        await expect(staking.connect(owner).setAprNinetyDays(100)).to.be.revertedWith("AprAlreadySet")

        await staking.connect(owner).setAprNinetyDays(200)
        expect(await staking.aprNinety()).to.equal(200)
    })

    it("Should change aprOneEighty", async function () {
        // should revert if not owner
        await expect(staking.connect(user1).setAprOneEightyDays(100)).to.be.revertedWith("Ownable: caller is not the owner")

        expect(await staking.aprOneEighty()).to.equal(600)

        // should revert with InvalidApr if 0
        await expect(staking.connect(owner).setAprOneEightyDays(0)).to.be.revertedWith("InvalidApr")

        // should revert with AprAlreadySet
        await staking.connect(owner).setAprOneEightyDays(100)
        await expect(staking.connect(owner).setAprOneEightyDays(100)).to.be.revertedWith("AprAlreadySet")

        await staking.connect(owner).setAprOneEightyDays(200)
        expect(await staking.aprOneEighty()).to.equal(200)
    })

    it("Should change aprThreeSixty", async function () {
        // should revert if not owner
        await expect(staking.connect(user1).setAprThreeSixtyDays(100)).to.be.revertedWith("Ownable: caller is not the owner")

        expect(await staking.aprThreeSixty()).to.equal(800)

        // should revert with InvalidApr if 0
        await expect(staking.connect(owner).setAprThreeSixtyDays(0)).to.be.revertedWith("InvalidApr")

        // should revert with AprAlreadySet
        await staking.connect(owner).setAprThreeSixtyDays(100)
        await expect(staking.connect(owner).setAprThreeSixtyDays(100)).to.be.revertedWith("AprAlreadySet")

        await staking.connect(owner).setAprThreeSixtyDays(200)
        expect(await staking.aprThreeSixty()).to.equal(200)
    })

    it("Should bulk change APY", async function () {
        // should revert if not owner
        await expect(staking.connect(user1).bulkSetApr(100, 200, 300)).to.be.revertedWith("Ownable: caller is not the owner")

        // should revert if any of the aprs is 0
        await expect(staking.connect(owner).bulkSetApr(0, 200, 300)).to.be.revertedWith("InvalidApr")
        await expect(staking.connect(owner).bulkSetApr(100, 0, 300)).to.be.revertedWith("InvalidApr")
        await expect(staking.connect(owner).bulkSetApr(100, 200, 0)).to.be.revertedWith("InvalidApr")

        expect(await staking.aprNinety()).to.equal(400)
        expect(await staking.aprOneEighty()).to.equal(600)
        expect(await staking.aprThreeSixty()).to.equal(800)

        await staking.connect(owner).bulkSetApr(100, 200, 300)

        expect(await staking.aprNinety()).to.equal(100)
        expect(await staking.aprOneEighty()).to.equal(200)
        expect(await staking.aprThreeSixty()).to.equal(300)
    })

    it("Should deposit tokens into 90 days pool", async function () {
        // should revert if not owner
        await expect(staking.connect(user1).depositStakingPoolNinetyDays(eth(100))).to.be.revertedWith("Ownable: caller is not the owner")

        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(300))
        await staking.connect(owner).depositStakingPoolNinetyDays(eth(300))

        expect(await staking.stakingPoolNinety()).to.equal(eth(300))

        // deposit more tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(200))
        await staking.connect(owner).depositStakingPoolNinetyDays(eth(200))

        expect(await staking.stakingPoolNinety()).to.equal(eth(500))
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(500))
    })

    it("Should deposit tokens into 180 days pool", async function () {
        // should revert if not owner
        await expect(staking.connect(user1).depositStakingPoolOneEightyDays(eth(100))).to.be.revertedWith("Ownable: caller is not the owner")

        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(300))
        await staking.connect(owner).depositStakingPoolOneEightyDays(eth(300))

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(300))

        // deposit more tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(200))
        await staking.connect(owner).depositStakingPoolOneEightyDays(eth(200))

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(500))
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(500))
    })

    it("Should deposit tokens into 365 days pool", async function () {
        // should revert if not owner
        await expect(staking.connect(user1).depositStakingPoolThreeSixtyDays(eth(100))).to.be.revertedWith("Ownable: caller is not the owner")

        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(300))
        await staking.connect(owner).depositStakingPoolThreeSixtyDays(eth(300))

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(300))

        // deposit more tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(200))
        await staking.connect(owner).depositStakingPoolThreeSixtyDays(eth(200))

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(500))
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(500))
    })

    it("Should be able to withdraw tokens from 90 days pool", async function () {
        // should revert if not owner
        await expect(staking.connect(user1).withdrawStakingPoolNinetyDays(eth(100))).to.be.revertedWith("Ownable: caller is not the owner")

        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(300))
        await staking.connect(owner).depositStakingPoolNinetyDays(eth(300))

        expect(await staking.stakingPoolNinety()).to.equal(eth(300))

        // should revert if trying to withdraw more than in the pool
        await expect(staking.connect(owner).withdrawStakingPoolNinetyDays(eth(400))).to.be.revertedWith("NotEnoughTokensIntoStakingPool")
        
        // withdraw tokens from the staking contract
        await staking.connect(owner).withdrawStakingPoolNinetyDays(eth(200))

        expect(await staking.stakingPoolNinety()).to.equal(eth(100))
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(100))
        expect(await tokenName.balanceOf(owner.address)).to.equal(eth(20999900))

    })

    it("Should be able to withdraw tokens from 180 days pool", async function () {
        // should revert if not owner
        await expect(staking.connect(user1).withdrawStakingPoolOneEightyDays(eth(100))).to.be.revertedWith("Ownable: caller is not the owner")

        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(300))
        await staking.connect(owner).depositStakingPoolOneEightyDays(eth(300))

        // should revert if trying to withdraw more than in the pool
        await expect(staking.connect(owner).withdrawStakingPoolOneEightyDays(eth(400))).to.be.revertedWith("NotEnoughTokensIntoStakingPool")

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(300))

        // withdraw tokens from the staking contract
        await staking.connect(owner).withdrawStakingPoolOneEightyDays(eth(200))

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(100))
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(100))
    })

    it("Should be able to withdraw tokens from 365 days pool", async function () {
        // should revert if not owner
        await expect(staking.connect(user1).withdrawStakingPoolThreeSixtyDays(eth(100))).to.be.revertedWith("Ownable: caller is not the owner")

        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(300))
        await staking.connect(owner).depositStakingPoolThreeSixtyDays(eth(300))

        // should revert if trying to withdraw more than in the pool
        await expect(staking.connect(owner).withdrawStakingPoolThreeSixtyDays(eth(400))).to.be.revertedWith("NotEnoughTokensIntoStakingPool")

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(300))

        // withdraw tokens from the staking contract
        await staking.connect(owner).withdrawStakingPoolThreeSixtyDays(eth(200))

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(100))
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(100))
    })
})

describe("Staking NinetyDays tests", async function () {

    before(async function () {
        [deployer, owner, user1, user2] = await ethers.getSigners();

        // deploy the uniswap v2 protocol
        const deploymentResult = await UniswapV2Deployer.deploy(owner);
        router = deploymentResult.router;

        // Deploy the Token contract as a proxy
        TokenName = await ethers.getContractFactory("TokenName");
        tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);

        // Deploy the Staking contract
        Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(tokenName.address, owner.address);

        // add staking contract address to isExcludedFee
        await tokenName.connect(owner).setIsExcludedFee(staking.address, true);

        // Transfer tokens to user1 and user2
        await tokenName.connect(owner).transfer(user1.address, eth(100000));
        await tokenName.connect(owner).transfer(user2.address, eth(200000));
    })

    it("should not be able to stake when no tokens in pool", async function () {
        // Approve and stake tokens for ninety days
        await tokenName.connect(user1).approve(staking.address, eth(100));
        await expect(staking.connect(user1).stakeNinetyDays(eth(100))).to.be.revertedWith("NotEnoughTokensIntoStakingPool");
    })

    it("should not be possible to withdraw when nothing to withdraw", async function () {
        await expect(staking.connect(user1).withdrawNinetyDays()).to.be.revertedWith("NothingToWithdraw");
    })

    it("should deposit tokens to the staking contract", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(200000));
        await staking.connect(owner).depositStakingPoolNinetyDays(eth(200000));

        expect(await staking.stakingPoolNinety()).to.equal(eth(200000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(200000));
    })

    it("should be able to stake tokens for ninety days with user1", async function () {
        // Approve and stake tokens for ninety days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeNinetyDays(eth(100000));

        expect(await staking.stakingPoolNinety()).to.equal(eth(100000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(300000));

        // Check the stakedAmount, unlockTime, and userReward of user1
        const user1Stake = await staking.stakesNinety(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(100000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 90);
        expect(await user1Stake.userReward).to.equal(eth(100000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(0));
    })

    it("Should deposit more tokens to the staking contract", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(300000));
        await staking.connect(owner).depositStakingPoolNinetyDays(eth(300000));

        expect(await staking.stakingPoolNinety()).to.equal(eth(400000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(600000));
    })

    it("should be able to stake tokens for ninety days with user2", async function () {
        // Approve and stake tokens for ninety days
        await tokenName.connect(user2).approve(staking.address, eth(200000));
        await staking.connect(user2).stakeNinetyDays(eth(200000));

        expect(await staking.stakingPoolNinety()).to.equal(eth(200000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(800000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user2Stake = await staking.stakesNinety(user2.address);
        expect(await user2Stake.stakedAmount).to.equal(eth(200000));
        expect(await user2Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 90);
        expect(await user2Stake.userReward).to.equal(eth(200000));
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(0));

        // go 10 days into the future
        await moveTime(SECONDS_IN_A_DAY * 10)
    });
    
    it("should not be able to withdraw staked tokens before ninety days", async function () {
        // Withdraw
        await expect(staking.connect(user1).withdrawNinetyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawNinetyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be changing the apr", async function () {
        expect(await staking.aprNinety()).to.equal(400);

        // call setAprNinetyDays with a new apr of 200
        await staking.connect(owner).setAprNinetyDays(200);

        expect(await staking.aprNinety()).to.equal(200);
    })

    it("should be able to stake more tokens for ninety days with user1", async function () {
        await tokenName.connect(owner).transfer(user1.address, eth(100000));
        
        // Approve and stake tokens for ninety days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeNinetyDays(eth(100000));

        expect(await staking.stakingPoolNinety()).to.equal(eth(150000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(900000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user1Stake = await staking.stakesNinety(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(200000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 90);
        expect(await user1Stake.userReward).to.equal(eth(150000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(0));
    });

    it("should no be possible to withdraw staked tokens before ninety days", async function () {
        // go 79 days into the future
        await moveTime(SECONDS_IN_A_DAY * 79)

        // Withdraw
        await expect(staking.connect(user1).withdrawNinetyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawNinetyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw staked tokens after ninety days with user2", async function () {
        // go 1 days into the future
        await moveTime(SECONDS_IN_A_DAY * 1)

        // Withdraw staked tokens after ninety days with user2
        await staking.connect(user2).withdrawNinetyDays();

        // Check the stakedAmount and userReward of the user
        const user2Stake = await staking.stakesNinety(user2.address);
        expect(user2Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user2Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user2 balance
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(400000));
    });

    it("should not be able to withdraw with user1", async function () {
        await expect(staking.connect(user1).withdrawNinetyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw user1", async function () {
        // go 10 days into the future
        await moveTime(SECONDS_IN_A_DAY * 10)

        // Withdraw staked tokens after ninety days with user1
        await staking.connect(user1).withdrawNinetyDays();

        // Check the stakedAmount and userReward of the user
        const user1Stake = await staking.stakesNinety(user1.address);
        expect(user1Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user1Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user1 balance
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(350000));
    });
});

describe("Staking OneEightyDays tests", async function () {

    before(async function () {
        [deployer, owner, user1, user2] = await ethers.getSigners();

        // deploy the uniswap v2 protocol
        const deploymentResult = await UniswapV2Deployer.deploy(owner);
        router = deploymentResult.router;

        // Deploy the Token contract as a proxy
        TokenName = await ethers.getContractFactory("TokenName");
        tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);

        // Deploy the Staking contract
        Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(tokenName.address, owner.address);

        // add staking contract address to isExcludedFee
        await tokenName.connect(owner).setIsExcludedFee(staking.address, true);

        // Transfer tokens to user1 and user2
        await tokenName.connect(owner).transfer(user1.address, eth(100000));
        await tokenName.connect(owner).transfer(user2.address, eth(200000));
    })

    it("should not be able to stake when no tokens in pool", async function () {
        // Approve and stake tokens for OneEighty days
        await tokenName.connect(user1).approve(staking.address, eth(100));
        await expect(staking.connect(user1).stakeOneEightyDays(eth(100))).to.be.revertedWith("NotEnoughTokensIntoStakingPool");
    })

    it("should not be possible to withdraw when nothing to withdraw", async function () {
        await expect(staking.connect(user1).withdrawOneEightyDays()).to.be.revertedWith("NothingToWithdraw");
    })

    it("should deposit tokens to the staking contract", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(600000));
        await staking.connect(owner).depositStakingPoolOneEightyDays(eth(600000));

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(600000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(600000));
    })

    it("should be able to stake tokens for OneEighty days with user1", async function () {
        // Approve and stake tokens for OneEighty days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeOneEightyDays(eth(100000));

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(300000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(700000));

        // Check the stakedAmount, unlockTime, and userReward of user1
        const user1Stake = await staking.stakesOneEighty(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(100000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 180);
        expect(await user1Stake.userReward).to.equal(eth(300000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(0));
    })

    it("Should deposit more tokens to the staking contract", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(900000));
        await staking.connect(owner).depositStakingPoolOneEightyDays(eth(900000));

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(1200000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(1600000));
    })

    it("should be able to stake tokens for OneEighty days with user2", async function () {
        // Approve and stake tokens for OneEighty days
        await tokenName.connect(user2).approve(staking.address, eth(200000));
        await staking.connect(user2).stakeOneEightyDays(eth(200000));

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(600000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(1800000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user2Stake = await staking.stakesOneEighty(user2.address);
        expect(await user2Stake.stakedAmount).to.equal(eth(200000));
        expect(await user2Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 180);
        expect(await user2Stake.userReward).to.equal(eth(600000));
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(0));

        // go 10 days into the future
        await moveTime(SECONDS_IN_A_DAY * 10)
    });
    
    it("should not be able to withdraw staked tokens before OneEighty days", async function () {
        // Withdraw
        await expect(staking.connect(user1).withdrawOneEightyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawOneEightyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be changing the apr", async function () {
        expect(await staking.aprOneEighty()).to.equal(600);

        // call setAprOneEightyDays with a new apr of 200
        await staking.connect(owner).setAprOneEightyDays(400);

        expect(await staking.aprOneEighty()).to.equal(400);
    })

    it("should be able to stake more tokens for OneEighty days with user1", async function () {
        await tokenName.connect(owner).transfer(user1.address, eth(100000));
        
        // Approve and stake tokens for OneEighty days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeOneEightyDays(eth(100000));

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(400000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(1900000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user1Stake = await staking.stakesOneEighty(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(200000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 180);
        expect(await user1Stake.userReward).to.equal(eth(500000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(0));
    });

    it("should no be possible to withdraw staked tokens before OneEighty days", async function () {
        // go 169 days into the future
        await moveTime(SECONDS_IN_A_DAY * 169)

        // Withdraw
        await expect(staking.connect(user1).withdrawOneEightyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawOneEightyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw staked tokens after OneEighty days with user2", async function () {
        // go 1 days into the future
        await moveTime(SECONDS_IN_A_DAY * 1)

        // Withdraw staked tokens after OneEighty days with user2
        await staking.connect(user2).withdrawOneEightyDays();

        // Check the stakedAmount and userReward of the user
        const user2Stake = await staking.stakesOneEighty(user2.address);
        expect(user2Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user2Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user2 balance
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(800000));
    });

    it("should not be able to withdraw with user1", async function () {
        await expect(staking.connect(user1).withdrawOneEightyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw user1", async function () {
        // go 10 days into the future
        await moveTime(SECONDS_IN_A_DAY * 10)

        // Withdraw staked tokens after OneEighty days with user1
        await staking.connect(user1).withdrawOneEightyDays();

        // Check the stakedAmount and userReward of the user
        const user1Stake = await staking.stakesOneEighty(user1.address);
        expect(user1Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user1Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user1 balance
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(700000));
    });
});

describe("Staking ThreeSixtyDays tests", async function () {

    before(async function () {
        [deployer, owner, user1, user2] = await ethers.getSigners();

        // deploy the uniswap v2 protocol
        const deploymentResult = await UniswapV2Deployer.deploy(owner);
        router = deploymentResult.router;

        // Deploy the Token contract as a proxy
        TokenName = await ethers.getContractFactory("TokenName");
        tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);

        // Deploy the Staking contract
        Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(tokenName.address, owner.address);

        // add staking contract address to isExcludedFee
        await tokenName.connect(owner).setIsExcludedFee(staking.address, true);

        // Transfer tokens to user1 and user2
        await tokenName.connect(owner).transfer(user1.address, eth(100000));
        await tokenName.connect(owner).transfer(user2.address, eth(200000));
    })

    it("should not be able to stake when no tokens in pool", async function () {
        // Approve and stake tokens for ThreeSixty days
        await tokenName.connect(user1).approve(staking.address, eth(100));
        await expect(staking.connect(user1).stakeThreeSixtyDays(eth(100))).to.be.revertedWith("NotEnoughTokensIntoStakingPool");
    })

    it("should not be possible to withdraw when nothing to withdraw", async function () {
        await expect(staking.connect(user1).withdrawThreeSixtyDays()).to.be.revertedWith("NothingToWithdraw");
    })

    it("should deposit tokens to the staking contract", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(1000000));
        await staking.connect(owner).depositStakingPoolThreeSixtyDays(eth(1000000));

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(1000000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(1000000));
    })

    it("should be able to stake tokens for ThreeSixty days with user1", async function () {
        // Approve and stake tokens for ThreeSixty days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeThreeSixtyDays(eth(100000));

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(200000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(1100000));

        // Check the stakedAmount, unlockTime, and userReward of user1
        const user1Stake = await staking.stakesThreeSixty(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(100000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 360);
        expect(await user1Stake.userReward).to.equal(eth(800000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(0));
    })

    it("Should deposit more tokens to the staking contract", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(3000000));
        await staking.connect(owner).depositStakingPoolThreeSixtyDays(eth(3000000));

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(3200000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(4100000));
    })

    it("should be able to stake tokens for ThreeSixty days with user2", async function () {
        // Approve and stake tokens for ThreeSixty days
        await tokenName.connect(user2).approve(staking.address, eth(200000));
        await staking.connect(user2).stakeThreeSixtyDays(eth(200000));

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(1600000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(4300000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user2Stake = await staking.stakesThreeSixty(user2.address);
        expect(await user2Stake.stakedAmount).to.equal(eth(200000));
        expect(await user2Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 360);
        expect(await user2Stake.userReward).to.equal(eth(1600000));
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(0));

        // go 10 days into the future
        await moveTime(SECONDS_IN_A_DAY * 10)
    });
    
    it("should not be able to withdraw staked tokens before ThreeSixty days", async function () {
        // Withdraw
        await expect(staking.connect(user1).withdrawThreeSixtyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawThreeSixtyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be changing the apr", async function () {
        expect(await staking.aprThreeSixty()).to.equal(800);

        // call setAprThreeSixtyDays with a new apr of 200
        await staking.connect(owner).setAprThreeSixtyDays(600);

        expect(await staking.aprThreeSixty()).to.equal(600);
    })

    it("should be able to stake more tokens for ThreeSixty days with user1", async function () {
        await tokenName.connect(owner).transfer(user1.address, eth(100000));
        
        // Approve and stake tokens for ThreeSixty days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeThreeSixtyDays(eth(100000));

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(1000000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(4400000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user1Stake = await staking.stakesThreeSixty(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(200000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 360);
        expect(await user1Stake.userReward).to.equal(eth(1400000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(0));
    });

    it("should no be possible to withdraw staked tokens before ThreeSixty days", async function () {
        // go 169 days into the future
        await moveTime(SECONDS_IN_A_DAY * 349)

        // Withdraw
        await expect(staking.connect(user1).withdrawThreeSixtyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawThreeSixtyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw staked tokens after ThreeSixty days with user2", async function () {
        // go 1 days into the future
        await moveTime(SECONDS_IN_A_DAY * 1)

        // Withdraw staked tokens after ThreeSixty days with user2
        await staking.connect(user2).withdrawThreeSixtyDays();

        // Check the stakedAmount and userReward of the user
        const user2Stake = await staking.stakesThreeSixty(user2.address);
        expect(user2Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user2Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user2 balance
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(1800000));
    });

    it("should not be able to withdraw with user1", async function () {
        await expect(staking.connect(user1).withdrawThreeSixtyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw user1", async function () {
        // go 10 days into the future
        await moveTime(SECONDS_IN_A_DAY * 10)

        // Withdraw staked tokens after ThreeSixty days with user1
        await staking.connect(user1).withdrawThreeSixtyDays();

        // Check the stakedAmount and userReward of the user
        const user1Stake = await staking.stakesThreeSixty(user1.address);
        expect(user1Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user1Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user1 balance
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(1600000));
    });
});


describe("All staking simultaneously tests", async function () {

    before(async function () {
        [deployer, owner, user1, user2] = await ethers.getSigners();

        // deploy the uniswap v2 protocol
        const deploymentResult = await UniswapV2Deployer.deploy(owner);
        router = deploymentResult.router;

        // Deploy the Token contract as a proxy
        TokenName = await ethers.getContractFactory("TokenName");
        tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);

        // Deploy the Staking contract
        Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(tokenName.address, owner.address);

        // add staking contract address to isExcludedFee
        await tokenName.connect(owner).setIsExcludedFee(staking.address, true);

        // Transfer tokens to user1 and user2
        await tokenName.connect(owner).transfer(user1.address, eth(300000));
        await tokenName.connect(owner).transfer(user2.address, eth(600000));
    })

    it("should not be able to stake when no tokens in pool - NinetyDays", async function () {
        // Approve and stake tokens for ninety days
        await tokenName.connect(user1).approve(staking.address, eth(100));
        await expect(staking.connect(user1).stakeNinetyDays(eth(100))).to.be.revertedWith("NotEnoughTokensIntoStakingPool");
    })

    it("should not be possible to withdraw when nothing to withdraw - NinetyDays", async function () {
        await expect(staking.connect(user1).withdrawNinetyDays()).to.be.revertedWith("NothingToWithdraw");
    })

    it("should not be able to stake when no tokens in pool - OneEighty", async function () {
        // Approve and stake tokens for OneEighty days
        await tokenName.connect(user1).approve(staking.address, eth(100));
        await expect(staking.connect(user1).stakeOneEightyDays(eth(100))).to.be.revertedWith("NotEnoughTokensIntoStakingPool");
    })

    it("should not be possible to withdraw when nothing to withdraw - OneEighty", async function () {
        await expect(staking.connect(user1).withdrawOneEightyDays()).to.be.revertedWith("NothingToWithdraw");
    })

    it("should not be able to stake when no tokens in pool - ThreeSixty", async function () {
        // Approve and stake tokens for ThreeSixty days
        await tokenName.connect(user1).approve(staking.address, eth(100));
        await expect(staking.connect(user1).stakeThreeSixtyDays(eth(100))).to.be.revertedWith("NotEnoughTokensIntoStakingPool");
    })

    it("should not be possible to withdraw when nothing to withdraw - ThreeSixty", async function () {
        await expect(staking.connect(user1).withdrawThreeSixtyDays()).to.be.revertedWith("NothingToWithdraw");
    })



    it("should deposit tokens to the staking contract - NinetyDays", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(200000));
        await staking.connect(owner).depositStakingPoolNinetyDays(eth(200000));

        expect(await staking.stakingPoolNinety()).to.equal(eth(200000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(200000));
    })

    it("should be able to stake tokens for ninety days with user1 - NinetyDays", async function () {
        // Approve and stake tokens for ninety days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeNinetyDays(eth(100000));

        expect(await staking.stakingPoolNinety()).to.equal(eth(100000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(300000));

        // Check the stakedAmount, unlockTime, and userReward of user1
        const user1Stake = await staking.stakesNinety(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(100000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 90);
        expect(await user1Stake.userReward).to.equal(eth(100000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(200000));
    })

    it("should deposit tokens to the staking contract - OneEighty", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(600000));
        await staking.connect(owner).depositStakingPoolOneEightyDays(eth(600000));

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(600000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(900000));
    })

    it("should be able to stake tokens for OneEighty days with user1 - OneEighty", async function () {
        // Approve and stake tokens for OneEighty days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeOneEightyDays(eth(100000));

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(300000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(1000000));

        // Check the stakedAmount, unlockTime, and userReward of user1
        const user1Stake = await staking.stakesOneEighty(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(100000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 180);
        expect(await user1Stake.userReward).to.equal(eth(300000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(100000));
    })

    it("should deposit tokens to the staking contract - ThreeSixty", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(1000000));
        await staking.connect(owner).depositStakingPoolThreeSixtyDays(eth(1000000));

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(1000000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(2000000));
    })

    it("should be able to stake tokens for ThreeSixty days with user1 - ThreeSixty", async function () {
        // Approve and stake tokens for ThreeSixty days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeThreeSixtyDays(eth(100000));

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(200000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(2100000));

        // Check the stakedAmount, unlockTime, and userReward of user1
        const user1Stake = await staking.stakesThreeSixty(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(100000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 360);
        expect(await user1Stake.userReward).to.equal(eth(800000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(0));
    })

    it("Should deposit more tokens to the staking contract - NinetyDays", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(300000));
        await staking.connect(owner).depositStakingPoolNinetyDays(eth(300000));

        expect(await staking.stakingPoolNinety()).to.equal(eth(400000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(2400000));
    })

    it("Should deposit more tokens to the staking contract - OneEighty", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(900000));
        await staking.connect(owner).depositStakingPoolOneEightyDays(eth(900000));

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(1200000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(3300000));
    })

    it("Should deposit more tokens to the staking contract - ThreeSixty", async function () {
        // deposit tokens to the staking contract
        await tokenName.connect(owner).approve(staking.address, eth(3000000));
        await staking.connect(owner).depositStakingPoolThreeSixtyDays(eth(3000000));

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(3200000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(6300000));
    })

    it("should be able to stake tokens for ninety days with user2 - NinetyDays", async function () {
        // Approve and stake tokens for ninety days
        await tokenName.connect(user2).approve(staking.address, eth(200000));
        await staking.connect(user2).stakeNinetyDays(eth(200000));

        expect(await staking.stakingPoolNinety()).to.equal(eth(200000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(6500000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user2Stake = await staking.stakesNinety(user2.address);
        expect(await user2Stake.stakedAmount).to.equal(eth(200000));
        expect(await user2Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 90);
        expect(await user2Stake.userReward).to.equal(eth(200000));
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(400000));
    });
    
    it("should be able to stake tokens for OneEighty days with user2 - OneEighty", async function () {
        // Approve and stake tokens for OneEighty days
        await tokenName.connect(user2).approve(staking.address, eth(200000));
        await staking.connect(user2).stakeOneEightyDays(eth(200000));

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(600000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(6700000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user2Stake = await staking.stakesOneEighty(user2.address);
        expect(await user2Stake.stakedAmount).to.equal(eth(200000));
        expect(await user2Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 180);
        expect(await user2Stake.userReward).to.equal(eth(600000));
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(200000));
    });
    
    it("should be able to stake tokens for ThreeSixty days with user2 - ThreeSixty", async function () {
        // Approve and stake tokens for ThreeSixty days
        await tokenName.connect(user2).approve(staking.address, eth(200000));
        await staking.connect(user2).stakeThreeSixtyDays(eth(200000));

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(1600000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(6900000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user2Stake = await staking.stakesThreeSixty(user2.address);
        expect(await user2Stake.stakedAmount).to.equal(eth(200000));
        expect(await user2Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 360);
        expect(await user2Stake.userReward).to.equal(eth(1600000));
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(0));

        // go 10 days into the future
        await moveTime(SECONDS_IN_A_DAY * 10)
    });

    it("should not be able to withdraw staked tokens before ninety days - NinetyDays", async function () {
        // Withdraw
        await expect(staking.connect(user1).withdrawNinetyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawNinetyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should not be able to withdraw staked tokens before OneEighty days - OneEighty", async function () {
        // Withdraw
        await expect(staking.connect(user1).withdrawOneEightyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawOneEightyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should not be able to withdraw staked tokens before ThreeSixty days - ThreeSixty", async function () {
        // Withdraw
        await expect(staking.connect(user1).withdrawThreeSixtyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawThreeSixtyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be bulk changing the APR", async function () {
        // Change the APR
        await staking.connect(owner).bulkSetApr(200, 400, 600);

        expect(await staking.aprNinety()).to.equal(200);
        expect(await staking.aprOneEighty()).to.equal(400);
        expect(await staking.aprThreeSixty()).to.equal(600);
    });

    it("should be able to stake more tokens for ninety days with user1 - NinetyDays", async function () {
        await tokenName.connect(owner).transfer(user1.address, eth(100000));
        
        // Approve and stake tokens for ninety days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeNinetyDays(eth(100000));

        expect(await staking.stakingPoolNinety()).to.equal(eth(150000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(7000000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user1Stake = await staking.stakesNinety(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(200000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 90);
        expect(await user1Stake.userReward).to.equal(eth(150000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(0));
    });

    it("should be able to stake more tokens for OneEighty days with user1 - OneEighty", async function () {
        await tokenName.connect(owner).transfer(user1.address, eth(100000));
        
        // Approve and stake tokens for OneEighty days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeOneEightyDays(eth(100000));

        expect(await staking.stakingPoolOneEighty()).to.equal(eth(400000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(7100000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user1Stake = await staking.stakesOneEighty(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(200000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 180);
        expect(await user1Stake.userReward).to.equal(eth(500000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(0));
    });

    it("should be able to stake more tokens for ThreeSixty days with user1 - ThreeSixty", async function () {
        await tokenName.connect(owner).transfer(user1.address, eth(100000));
        
        // Approve and stake tokens for ThreeSixty days
        await tokenName.connect(user1).approve(staking.address, eth(100000));
        await staking.connect(user1).stakeThreeSixtyDays(eth(100000));

        expect(await staking.stakingPoolThreeSixty()).to.equal(eth(1000000));
        expect(await tokenName.balanceOf(staking.address)).to.equal(eth(7200000));

        // Check the stakedAmount, unlockTime, and userReward of the user
        const user1Stake = await staking.stakesThreeSixty(user1.address);
        expect(await user1Stake.stakedAmount).to.equal(eth(200000));
        expect(await user1Stake.unlockTime).to.equal((await ethers.provider.getBlock()).timestamp + SECONDS_IN_A_DAY * 360);
        expect(await user1Stake.userReward).to.equal(eth(1400000));
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(0));
    });

    it("should no be possible to withdraw staked tokens before ninety days - NinetyDays", async function () {
        // go 79 days into the future
        await moveTime(SECONDS_IN_A_DAY * 79)

        // Withdraw
        await expect(staking.connect(user1).withdrawNinetyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawNinetyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw staked tokens after ninety days with user2 - NinetyDays", async function () {
        // go 1 days into the future
        await moveTime(SECONDS_IN_A_DAY * 1)

        // Withdraw staked tokens after ninety days with user2
        await staking.connect(user2).withdrawNinetyDays();

        // Check the stakedAmount and userReward of the user
        const user2Stake = await staking.stakesNinety(user2.address);
        expect(user2Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user2Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user2 balance
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(400000));
    });

    it("should not be able to withdraw with user1 - NinetyDays", async function () {
        await expect(staking.connect(user1).withdrawNinetyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw user1 - NinetyDays", async function () {
        // go 10 days into the future
        await moveTime(SECONDS_IN_A_DAY * 10)

        // Withdraw staked tokens after ninety days with user1
        await staking.connect(user1).withdrawNinetyDays();

        // Check the stakedAmount and userReward of the user
        const user1Stake = await staking.stakesNinety(user1.address);
        expect(user1Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user1Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user1 balance
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(350000));
    });

    it("should no be possible to withdraw staked tokens before OneEighty days - OneEighty", async function () {
        // go 79 days into the future
        await moveTime(SECONDS_IN_A_DAY * 79)

        // Withdraw
        await expect(staking.connect(user1).withdrawOneEightyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawOneEightyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw staked tokens after OneEighty days with user2 - OneEighty", async function () {
        // go 1 days into the future
        await moveTime(SECONDS_IN_A_DAY * 1)

        // Withdraw staked tokens after OneEighty days with user2
        await staking.connect(user2).withdrawOneEightyDays();

        // Check the stakedAmount and userReward of the user
        const user2Stake = await staking.stakesOneEighty(user2.address);
        expect(user2Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user2Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user2 balance
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(1200000));
    });

    it("should not be able to withdraw with user1 - OneEighty", async function () {
        await expect(staking.connect(user1).withdrawOneEightyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw user1 - OneEighty", async function () {
        // go 10 days into the future
        await moveTime(SECONDS_IN_A_DAY * 10)

        // Withdraw staked tokens after OneEighty days with user1
        await staking.connect(user1).withdrawOneEightyDays();

        // Check the stakedAmount and userReward of the user
        const user1Stake = await staking.stakesOneEighty(user1.address);
        expect(user1Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user1Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user1 balance
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(1050000));
    });

    it("should no be possible to withdraw staked tokens before ThreeSixty days - ThreeSixty", async function () {
        // go 169 days into the future
        await moveTime(SECONDS_IN_A_DAY * 169)

        // Withdraw
        await expect(staking.connect(user1).withdrawThreeSixtyDays()).to.be.revertedWith("StakingPeriodNotOver");
        await expect(staking.connect(user2).withdrawThreeSixtyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw staked tokens after ThreeSixty days with user2 - ThreeSixty", async function () {
        // go 1 days into the future
        await moveTime(SECONDS_IN_A_DAY * 1)

        // Withdraw staked tokens after ThreeSixty days with user2
        await staking.connect(user2).withdrawThreeSixtyDays();

        // Check the stakedAmount and userReward of the user
        const user2Stake = await staking.stakesThreeSixty(user2.address);
        expect(user2Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user2Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user2 balance
        expect(await tokenName.balanceOf(user2.address)).to.equal(eth(3000000));
    });

    it("should not be able to withdraw with user1 - ThreeSixty", async function () {
        await expect(staking.connect(user1).withdrawThreeSixtyDays()).to.be.revertedWith("StakingPeriodNotOver");
    });

    it("should be able to withdraw user1 - ThreeSixty", async function () {
        // go 10 days into the future
        await moveTime(SECONDS_IN_A_DAY * 10)

        // Withdraw staked tokens after ThreeSixty days with user1
        await staking.connect(user1).withdrawThreeSixtyDays();

        // Check the stakedAmount and userReward of the user
        const user1Stake = await staking.stakesThreeSixty(user1.address);
        expect(user1Stake.stakedAmount).to.equal(ethers.BigNumber.from(0));
        expect(user1Stake.userReward).to.equal(ethers.BigNumber.from(0));

        // check user1 balance
        expect(await tokenName.balanceOf(user1.address)).to.equal(eth(2650000));
    });
});

