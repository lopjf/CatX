// Load dependencies
const { expect } = require('chai');
const { BigNumber, constants } = require("ethers");
const { ethers, UniswapV2Deployer } = require("hardhat");

let TokenName;
let tokenName;

let deployer, owner, ownerRecipient, marketing, dev, user1, user2, user3, user4, influencer1, influencer2, influencer3, influencer4, anotherPair;

function eth(amount) {
  return ethers.utils.parseEther(amount.toString())
}

describe('Basic Initialisation', function () {
  
  let router;
 
  beforeEach(async function () {
    // Get signers
    [deployer, owner, ownerRecipient, marketing, dev, user1, user2, anotherPair] = await ethers.getSigners();
    
    // deploy the uniswap v2 protocol
    const deploymentResult = await UniswapV2Deployer.deploy(owner);
    router = deploymentResult.router;

    // Deploy the contract as a proxy
    TokenName = await ethers.getContractFactory("TokenName");
    tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);
  });
 
  // Test case
  it('Should be correct token name', async function () {
    expect(await tokenName.name()).to.equal("TokenName");
  });

  it('Should be correct token symbol', async function () {
    expect(await tokenName.symbol()).to.equal("TOK");
  });

  it('Should be correct token decimals', async function () {
    expect(await tokenName.decimals()).to.equal(18);
  });

  it('Should be correct token totalSupply', async function () {
    // should be 21 million, compare with bignumber
    expect(await tokenName.totalSupply()).to.eql(BigNumber.from("21000000000000000000000000"));
  });

  it('Should be correct token owner', async function () { // using hasRole
    // only owner should be owner. He's the one deploying the contract
    expect(await tokenName.owner()).to.equal(owner.address);
  });

  it('Should be correct token balance to owner', async function () {
    expect(await tokenName.balanceOf(owner.address)).to.eql(BigNumber.from("21000000000000000000000000"));
  });

  it('Should renounce ownership', async function () {
    // Call renounceOwnership with user1, should revert
    await expect(tokenName.connect(user1).renounceOwnership()).to.be.revertedWith("Ownable: caller is not the owner");

    // Call renounceOwnership with owner
    await tokenName.connect(owner).renounceOwnership();
    expect(await tokenName.owner()).to.equal(constants.AddressZero);
  });
});


describe('Setter Functions', function () {
  
  let router;
 
  beforeEach(async function () {
    // Get signers
    [deployer, owner, ownerRecipient, marketing, dev, user1, user2, anotherPair] = await ethers.getSigners();
    
    // deploy the uniswap v2 protocol
    const deploymentResult = await UniswapV2Deployer.deploy(owner);
    router = deploymentResult.router;

    // Deploy the contract as a proxy
    TokenName = await ethers.getContractFactory("TokenName");
    tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);
  });

  it('Should change fees addresses', async function () {
    // Call bulkSetAddresses with user1, should revert
    await expect(tokenName.connect(user1).bulkSetAddresses(owner.address, marketing.address, dev.address)).to.be.revertedWith("Ownable: caller is not the owner");

    // Call bulkSetAddresses with owner
    await tokenName.connect(owner).bulkSetAddresses(owner.address, marketing.address, dev.address);
    expect(await tokenName.ownerFeeRecipient()).to.equal(owner.address);
    expect(await tokenName.marketingFeeRecipient()).to.equal(marketing.address);
    expect(await tokenName.devFeeRecipient()).to.equal(dev.address);
  });

  it('Should change fees percentages', async function () {
    // Call bulkSetFees with user1, should revert
    await expect(tokenName.connect(user1).bulkSetFees(2, 2, 2, 2)).to.be.revertedWith("Ownable: caller is not the owner");

    // Call bulkSetFees with more than 8%, should revert
    await expect(tokenName.connect(owner).bulkSetFees(2, 2, 2, 3)).to.be.revertedWith("ExceedsFeesLimit");

    // Call bulkSetFees with owner
    await tokenName.connect(owner).bulkSetFees(2, 2, 2, 2);
    expect(await tokenName.ownerFeePercent()).to.equal(2);
    expect(await tokenName.marketingFeePercent()).to.equal(2);
    expect(await tokenName.devFeePercent()).to.equal(2);
    expect(await tokenName.liquidityFeePercent()).to.equal(2);

    await tokenName.connect(owner).bulkSetFees(0, 0, 0, 0);
    expect(await tokenName.ownerFeePercent()).to.equal(0);
    expect(await tokenName.marketingFeePercent()).to.equal(0);
    expect(await tokenName.devFeePercent()).to.equal(0);
    expect(await tokenName.liquidityFeePercent()).to.equal(0);
  });

  it('Should setIsExcludedFee properly', async function () {
    // Call setIsExcludedFee with user1, should revert
    await expect(tokenName.connect(user1).setIsExcludedFee(user1.address, true)).to.be.revertedWith("Ownable: caller is not the owner");
    
    // Call setIsExcludedFee with owner with an already excluded address, should revert
    await expect(tokenName.connect(owner).setIsExcludedFee(owner.address, true)).to.be.revertedWith("AlreadyExcludedFee");

    // Call setIsExcludedFee with owner to exclude from fees
    await tokenName.connect(owner).setIsExcludedFee(user1.address, true);
    expect(await tokenName.getIsExcludedFee(user1.address)).to.equal(true);
  
    // call setIsExcludedFee with owner to include from fees
    await tokenName.connect(owner).setIsExcludedFee(user1.address, false);
    expect(await tokenName.getIsExcludedFee(user1.address)).to.equal(false);
  });

  it('Should setIsBlacklisted properly', async function () {
    // Call setIsBlacklisted with user1, should revert
    await expect(tokenName.connect(user1).setIsBlacklisted(user1.address, true)).to.be.revertedWith("Ownable: caller is not the owner");
    
    // Call setIsBlacklisted with owner to blacklist
    await tokenName.connect(owner).setIsBlacklisted(user1.address, true);
    expect(await tokenName.getIsBlacklisted(user1.address)).to.equal(true);
  
    // Call setIsBlacklisted with owner with an already blacklisted address, should revert
    await expect(tokenName.connect(owner).setIsBlacklisted(user1.address, true)).to.be.revertedWith("AlreadyBlacklisted");

    // call setIsBlacklisted with owner to unblacklist
    await tokenName.connect(owner).setIsBlacklisted(user1.address, false);
    expect(await tokenName.getIsBlacklisted(user1.address)).to.equal(false);
  });

  it('Should setIsWalletLimitUnlimited properly', async function () {
    // Call setIsWalletLimitUnlimited with user1, should revert
    await expect(tokenName.connect(user1).setIsWalletLimitUnlimited(user1.address, true)).to.be.revertedWith("Ownable: caller is not the owner");
    
    // Call setIsWalletLimitUnlimited with owner to set wallet limit unlimited
    await tokenName.connect(owner).setIsWalletLimitUnlimited(user1.address, true);
    expect(await tokenName.getIsWalletLimitUnlimited(user1.address)).to.equal(true);
  
    // Call setIsWalletLimitUnlimited with owner with an already unlimited address, should revert
    await expect(tokenName.connect(owner).setIsWalletLimitUnlimited(user1.address, true)).to.be.revertedWith("AlreadyWalletLimitUnlimited");

    // call setIsWalletLimitUnlimited with owner to set wallet limit limited
    await tokenName.connect(owner).setIsWalletLimitUnlimited(user1.address, false);
    expect(await tokenName.getIsWalletLimitUnlimited(user1.address)).to.equal(false);
  }) ;

  it('Should setIsWalletsLimitEnabled properly', async function () {
    // Call setIsWalletsLimitEnabled with user1, should revert
    await expect(tokenName.connect(user1).setIsWalletsLimitEnabled(false)).to.be.revertedWith("Ownable: caller is not the owner");
    
    // IsWalletsLimitEnabled should be true upon deployment
    expect(await tokenName.isWalletsLimitEnabled()).to.equal(true);

    // Call setIsWalletsLimitEnabled with owner to enable wallet limit, should revert because AlreadyWalletsLimitEnabled
    await expect(tokenName.connect(owner).setIsWalletsLimitEnabled(true)).to.be.revertedWith("AlreadyWalletsLimitEnabled");
  
    // call setIsWalletsLimitEnabled with owner to disable wallet limit
    await tokenName.connect(owner).setIsWalletsLimitEnabled(false);
    expect(await tokenName.isWalletsLimitEnabled()).to.equal(false);
    await tokenName.connect(owner).setIsWalletsLimitEnabled(true);
    expect(await tokenName.isWalletsLimitEnabled()).to.equal(true);
  });

  it('Should setWalletsLimit properly', async function () {
    // Call setWalletsLimit with user1, should revert
    await expect(tokenName.connect(user1).setWalletsLimit(5)).to.be.revertedWith("Ownable: caller is not the owner");
    
    // walletsLimit should be 1 upon deployment
    expect(await tokenName.walletsLimit()).to.equal(1);

    // Call setWalletsLimit with owner to set wallet limit to 1, should revert
    await expect(tokenName.connect(owner).setWalletsLimit(1)).to.be.revertedWith("AlreadyWalletLimit");

    // Call setWalletsLimit with owner to set wallet limit to 0, should revert
    await expect(tokenName.connect(owner).setWalletsLimit(0)).to.be.revertedWith("WalletLimitZero");

    // Call setWalletsLimit with owner to set wallet limit
    await tokenName.connect(owner).setWalletsLimit(5);
    expect(await tokenName.walletsLimit()).to.equal(5);
  });

  it('Should setPairAddress properly', async function () {
    // Call setPairAddress with user1, should revert
    await expect(tokenName.connect(user1).setPairAddress(anotherPair.address, true)).to.be.revertedWith("Ownable: caller is not the owner");

    await tokenName.connect(owner).setPairAddress(anotherPair.address, true);
    expect(await tokenName.pairAddress(anotherPair.address)).to.equal(true);

    // Call setPairAddress with owner to set pair address to true, should revert because AlreadyAPairAddress
    await expect(tokenName.connect(owner).setPairAddress(await anotherPair.address, true)).to.be.revertedWith("AlreadyAPairAddress");

    // Call setPairAddress with owner to set another pair address
    expect(await tokenName.pairAddress(anotherPair.address)).to.equal(true);
    await tokenName.connect(owner).setPairAddress(anotherPair.address, false);
    expect(await tokenName.pairAddress(anotherPair.address)).to.equal(false);
  });

  it('Should setTxTrigger properly', async function () {
    // Call setTxTrigger with user1, should revert
    await expect(tokenName.connect(user1).setTxTrigger(100)).to.be.revertedWith("Ownable: caller is not the owner");
    
    // txTrigger should be 5 upon deployment
    expect(await tokenName.txTrigger()).to.equal(5);

    // Call setTxTrigger with owner to set txTrigger
    await tokenName.connect(owner).setTxTrigger(50);
    expect(await tokenName.txTrigger()).to.equal(50);

    // Call setTxTrigger with the same value, should revert because AlreadyTxTrigger
    await expect(tokenName.connect(owner).setTxTrigger(50)).to.be.revertedWith("AlreadyTxTrigger");
  });
});

describe('Airdrop', function () {

  let router;
 
  beforeEach(async function () {
    // Get signers
    [deployer, owner, ownerRecipient, marketing, dev, user1, user2, anotherPair] = await ethers.getSigners();
    
    // deploy the uniswap v2 protocol
    const deploymentResult = await UniswapV2Deployer.deploy(owner);
    router = deploymentResult.router;

    // Deploy the contract as a proxy
    TokenName = await ethers.getContractFactory("TokenName");
    tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);
  });

  it('Should deposit the correct amount of tokens to be airdropped', async function () {
    // deposit airdrop tokens to contract by calling depositAirdropTokens with user1, should revert
    await expect(tokenName.connect(user1).depositAirdropTokens(10000)).to.be.revertedWith("Ownable: caller is not the owner");

    // deposit airdrop tokens to contract by calling depositAirdropTokens with owner
    await tokenName.connect(owner).depositAirdropTokens(10000);
    expect(await tokenName.balanceOf(await tokenName.address)).to.eql(BigNumber.from("10000"));
    expect(await tokenName.airdropTokens()).to.eql(BigNumber.from("10000"));
  });

  it('Should airdrop the correct amount to multiple addresses', async function () {
    // Deposit airdrop tokens to contract
    await tokenName.connect(owner).depositAirdropTokens(10000);
    expect(await tokenName.balanceOf(await tokenName.address)).to.eql(BigNumber.from("10000"));
    expect(await tokenName.airdropTokens()).to.eql(BigNumber.from("10000"));

    // Call bulkAirdrop with user1, should revert
    await expect(tokenName.connect(user1).bulkAirdrop([user1.address], [1000])).to.be.revertedWith("Ownable: caller is not the owner");

    // Call bulkAirdrop with owner, give as parameter 1 address and 2 amounts, should revert with InvalidArrayLength
    await expect(tokenName.connect(owner).bulkAirdrop([user1.address], [1000, 2000])).to.be.revertedWith("InvalidArrayLength");

    // Call bulkAirdrop with owner, give as parameter 2 addresses and 1 amount, should revert with InvalidArrayLength
    await expect(tokenName.connect(owner).bulkAirdrop([user1.address, user2.address], [1000])).to.be.revertedWith("InvalidArrayLength");

    // Call bulkAirdrop with owner
    await tokenName.connect(owner).bulkAirdrop([user1.address, user2.address], [1000, 2000]);
    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("1000"));
    expect(await tokenName.balanceOf(user2.address)).to.eql(BigNumber.from("2000"));
    expect(await tokenName.airdropTokens()).to.eql(BigNumber.from("7000"));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(BigNumber.from("7000"));

    // Call bulkAirdrop with owner to airdrop more than available
    await expect(tokenName.connect(owner).bulkAirdrop([user1.address, user2.address], [5000, 3000])).to.be.revertedWith('InsufficientAirdropTokens');
  });

  it('Should withdrawToken if tokens sent to contract by mistake', async function () {
    // Deposit airdrop tokens to contract
    await tokenName.connect(owner).depositAirdropTokens(10000);
    expect(await tokenName.balanceOf(await tokenName.address)).to.eql(BigNumber.from("10000"));
    expect(await tokenName.airdropTokens()).to.eql(BigNumber.from("10000"));

    // Call withdrawToken with user1, should revert
    await expect(tokenName.connect(user1).withdrawToken(1000)).to.be.revertedWith("Ownable: caller is not the owner");

    // Send 10000 tokens to contract by mistake
    await tokenName.connect(owner).transfer(await tokenName.address, 10000);
    expect(await tokenName.balanceOf(await tokenName.address)).to.eql(BigNumber.from("20000"));

    // Call withdrawToken with owner
    const preTokenBalancers = await tokenName.balanceOf(owner.address);
    await tokenName.connect(owner).withdrawToken(1000);
    const postTokenBalancers = await tokenName.balanceOf(owner.address);
    expect(postTokenBalancers.sub(preTokenBalancers)).to.eql(BigNumber.from("1000"));
    expect(await tokenName.balanceOf(await tokenName.address)).to.eql(BigNumber.from("19000"));

    // withdrawToken 9001, should revert InsufficientBalance
    await expect(tokenName.connect(owner).withdrawToken(9001)).to.be.revertedWith("InsufficientBalance");

    // withdrawToken 9000
    const preTokenBalancers2 = await tokenName.balanceOf(owner.address);
    await tokenName.connect(owner).withdrawToken(9000);
    const postTokenBalancers2 = await tokenName.balanceOf(owner.address);
    expect(postTokenBalancers2.sub(preTokenBalancers2)).to.eql(BigNumber.from("9000"));
    expect(await tokenName.balanceOf(await tokenName.address)).to.eql(BigNumber.from("10000"));
  });
});

describe('transfering tokens', function () {
  
  let router;
 
  beforeEach(async function () {
    // Get signers
    [deployer, owner, ownerRecipient, marketing, dev, user1, user2, anotherPair] = await ethers.getSigners();
    
    // deploy the uniswap v2 protocol
    const deploymentResult = await UniswapV2Deployer.deploy(owner);
    factory = deploymentResult.factory;
    router = deploymentResult.router;

    // Deploy the contract as a proxy
    TokenName = await ethers.getContractFactory("TokenName");
    tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);
  });

  it('Should revert if sender is blacklisted', async function () {
    // send 10000 tokens to user1
    await tokenName.connect(owner).transfer(user1.address, 10000);
    
    // Call setIsBlacklisted with owner to blacklist
    await tokenName.connect(owner).setIsBlacklisted(user1.address, true);
    expect(await tokenName.getIsBlacklisted(user1.address)).to.equal(true);

    // Call transfer with user1, should revert
    await expect(tokenName.connect(user1).transfer(user2.address, 1000)).to.be.revertedWith("BlacklistedAddress");
  });

  it('Should revert if recipient is blacklisted', async function () {
    // send 10000 tokens to user1
    await tokenName.connect(owner).transfer(user1.address, 10000);
    
    // Call setIsBlacklisted with owner to blacklist
    await tokenName.connect(owner).setIsBlacklisted(user2.address, true);
    expect(await tokenName.getIsBlacklisted(user2.address)).to.equal(true);

    // Call transfer with user1, should revert
    await expect(tokenName.connect(user1).transfer(user2.address, 1000)).to.be.revertedWith("BlacklistedAddress");
  });

  it('Should revert if recipient ExceedsWalletLimit', async function () {
    // Send tokens to user1
    await tokenName.connect(owner).transfer(user1.address, BigNumber.from("210000000000000000000001"));
    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("210000000000000000000001"));

    // send 210001 token to user2, should revert
    await expect(tokenName.connect(user1).transfer(user2.address, BigNumber.from("210000000000000000000001"))).to.be.revertedWith("ExceedsWalletLimit");

    // send 100000 tokens to user2
    await tokenName.connect(user1).transfer(user2.address, BigNumber.from("100000000000000000000000"));
    expect(await tokenName.balanceOf(user2.address)).to.eql(BigNumber.from("100000000000000000000000"));

    // send 110000 tokens to user2
    await tokenName.connect(user1).transfer(user2.address, BigNumber.from("110000000000000000000000"));
    expect(await tokenName.balanceOf(user2.address)).to.eql(BigNumber.from("210000000000000000000000"));

    // send 1 token to user2, should revert
    await expect(tokenName.connect(user1).transfer(user2.address, BigNumber.from("1"))).to.be.revertedWith("ExceedsWalletLimit");

    // exclude user2 from wallet limit (by updating isWalletLimitUnlimited)
    await tokenName.connect(owner).setIsWalletLimitUnlimited(user2.address, true);
    expect(await tokenName.getIsWalletLimitUnlimited(user2.address)).to.equal(true);

    // send 1 token to user2
    await tokenName.connect(user1).transfer(user2.address, BigNumber.from("1"));
    expect(await tokenName.balanceOf(user2.address)).to.eql(BigNumber.from("210000000000000000000001"));

    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("0"));

    // send back all tokens to user1, should revert
    await expect(tokenName.connect(user2).transfer(user1.address, BigNumber.from("210000000000000000000001"))).to.be.revertedWith("ExceedsWalletLimit");
  
    // increase walletsLimit to 2
    await tokenName.connect(owner).setWalletsLimit(2);

    // send back all tokens to user1
    await tokenName.connect(user2).transfer(user1.address, BigNumber.from("210000000000000000000001"));
    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("210000000000000000000001"));

    await tokenName.connect(owner).transfer(user1.address, BigNumber.from("210000000000000000000000"));
    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("420000000000000000000001"));

    // remove user2 from wallet limit (by updating isWalletLimitUnlimited)
    await tokenName.connect(owner).setIsWalletLimitUnlimited(user2.address, false);

    // send all tokens to user2, should revert
    await expect(tokenName.connect(user1).transfer(user2.address, BigNumber.from("420000000000000000000001"))).to.be.revertedWith("ExceedsWalletLimit");

    // modify isWalletsLimitEnabled to false
    await tokenName.connect(owner).setIsWalletsLimitEnabled(false);

    // send all tokens to user2
    await tokenName.connect(user1).transfer(user2.address, BigNumber.from("420000000000000000000001"));
    expect(await tokenName.balanceOf(user2.address)).to.eql(BigNumber.from("420000000000000000000001"));
  });

  it('Should transfer the full amount (no tax, no fees on transfers)', async function () {
    // Send tokens to user1
    await tokenName.connect(owner).transfer(user1.address, 1000);
    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("1000"));

    // Call transfer with user1 to user2
    await tokenName.connect(user1).transfer(user2.address, 1000);
    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("0"));
    expect(await tokenName.balanceOf(user2.address)).to.eql(BigNumber.from("1000"));
  });
});

describe('Buy / Sell on a DEX, priviledge user', function () {

  let factory;
  let router;
  let weth9;
  let pairAddress;

  beforeEach(async function () {
    // Get signers
    [deployer, owner, ownerRecipient, marketing, dev, user1, user2, anotherPair] = await ethers.getSigners();

    // deploy the uniswap v2 protocol
    const deploymentResult = await UniswapV2Deployer.deploy(owner);
    factory = deploymentResult.factory;
    router = deploymentResult.router;
    weth9 = deploymentResult.weth9;

    // Deploy the contract as a proxy
    TokenName = await ethers.getContractFactory("TokenName");
    tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);

    // approve the spending (to add liquidity)
    await tokenName.connect(owner).approve(router.address, constants.MaxUint256);

    // add 500 token with 10 eth to liquidity
    await router.addLiquidityETH(
      tokenName.address,
      eth(500),
      eth(500),
      eth(10),
      owner.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    pairAddress = await factory.getPair(tokenName.address, weth9.address)

    // call setPairAddress and setIsWalletLimitUnlimited
    await tokenName.connect(owner).setPairAddress(pairAddress, true);
    await tokenName.connect(owner).setIsWalletLimitUnlimited(pairAddress, true);

    // update the fee recipients
    await tokenName.connect(owner).bulkSetAddresses(
      owner.address, marketing.address, dev.address
    );
  });

  it('Should revert if user is blacklisted', async function () {
    await tokenName.connect(owner).setIsBlacklisted(user1.address, true);
    await expect(
      router.connect(user1).swapExactETHForTokens(
        eth(1),
        [weth9.address, tokenName.address],
        user1.address,
        constants.MaxUint256,
        { value: eth(10) }
      )
    ).to.be.reverted;    
  });

  it('Should skip fees if user isExcludedFee', async function () {
    // fetch owner balances
    const ownerTokenBalance = await tokenName.balanceOf(owner.address);
    
    await tokenName.connect(owner).setIsExcludedFee(user1.address, true);

    // buy 1 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(1));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(owner.address)).to.eql(ownerTokenBalance);
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(0));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
  });

  it('Should revert if balance is higher than walletsLimit % total supply', async () => {
    await tokenName.connect(owner).transfer(user1.address, BigNumber.from("21000000000000000000000000").div(100));
    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("21000000000000000000000000").div(100));

    // buy 1 token #1
    await expect(router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )).to.be.reverted;

    // exclude fee for user1
    await tokenName.connect(owner).setIsExcludedFee(user1.address, true);

    // buy 1 token #2
    await router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    );

    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("210001000000000000000000"));
  });

  it('Should not have wallet limits if user is excluded fees', async () => {
    await tokenName.connect(owner).transfer(user1.address, BigNumber.from("21000000000000000000000000").div(100));
    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("21000000000000000000000000").div(100));

    // exclude fee for user1
    await tokenName.connect(owner).setIsExcludedFee(user1.address, true);

    // buy 1 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    );

    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("210001000000000000000000"));
  });

  it('Should not apply wallet limit if isWalletLimitEnabled is set to false', async () => {
    await tokenName.connect(owner).transfer(user1.address, BigNumber.from("21000000000000000000000000").div(100));
    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("21000000000000000000000000").div(100));

    await tokenName.connect(owner).setIsWalletsLimitEnabled(false);

    // buy 1 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("210000970000000000000000")); // user payed fees in that case
  });

  it('Should not apply wallet limit if isWalletLimitUnlimited[walletaddress] is set to true', async () => {
    await tokenName.connect(owner).transfer(user1.address, BigNumber.from("21000000000000000000000000").div(100));
    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("21000000000000000000000000").div(100));

    await tokenName.connect(owner).setIsWalletLimitUnlimited(user1.address, true);

    // buy 1 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    expect(await tokenName.balanceOf(user1.address)).to.eql(BigNumber.from("210000970000000000000000")); // user payed fees in that case
  });
});

describe('Buy on a DEX, user lambda', function () {

  let factory;
  let router;
  let weth9;
  let pairAddress;

  beforeEach(async function () {
    // Get signers
    [deployer, owner, ownerRecipient, marketing, dev, user1, user2, anotherPair] = await ethers.getSigners();

    // deploy the uniswap v2 protocol
    const deploymentResult = await UniswapV2Deployer.deploy(owner);
    factory = deploymentResult.factory;
    router = deploymentResult.router;
    weth9 = deploymentResult.weth9;

    // Deploy the contract as a proxy
    TokenName = await ethers.getContractFactory("TokenName");
    tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);

    // approve the spending (to add liquidity)
    await tokenName.connect(owner).approve(router.address, constants.MaxUint256);

    // add 500 token with 10 eth to liquidity
    await router.addLiquidityETH(
      tokenName.address,
      eth(500),
      eth(500),
      eth(10),
      owner.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    pairAddress = await factory.getPair(tokenName.address, weth9.address)

    // call setPairAddress and setIsWalletLimitUnlimited
    await tokenName.connect(owner).setPairAddress(pairAddress, true);
    await tokenName.connect(owner).setIsWalletLimitUnlimited(pairAddress, true);

    // update the fee recipients
    await tokenName.connect(owner).bulkSetAddresses(
      owner.address, marketing.address, dev.address
    );

    // Reset ownerRecipient, marketing and dev wallets to 0
    await network.provider.send("hardhat_setBalance", [
      ownerRecipient.address,
      "0x0",
    ]);
    await network.provider.send("hardhat_setBalance", [
      marketing.address,
      "0x0",
    ]);
    await network.provider.send("hardhat_setBalance", [
      dev.address,
      "0x0",
    ]);
  });

  it('Should apply fees on buy, 3% total', async function () {

    // fetch owner balances
    const ownerTokenBalance = await tokenName.balanceOf(owner.address);
    
    // buy 1 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(.97));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(owner.address)).to.eql(ownerTokenBalance);
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(0.03));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(.01));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(.01));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(.01));

    // buy 1 token #2
    await router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // buy 1 token #3
    await router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // buy 1 token #4
    await router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(3.88));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(owner.address)).to.eql(ownerTokenBalance);
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(0.12));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(.04));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(.04));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(.04));


    // this transaction should not trigger a swap to ETH. because only swap on sell
    await router.connect(user1).swapETHForExactTokens(
      eth(1),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(4.85));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(owner.address)).to.eql(ownerTokenBalance);
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(0.15));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(.05));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(.05));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(.05));
  });
});

describe('Sell on a DEX, user lambda', function () {

  let factory;
  let router;
  let weth9;

  let pairAddress;

  beforeEach(async function () {
    // Get signers
    [deployer, owner, ownerRecipient, marketing, dev, user1, user2, anotherPair] = await ethers.getSigners();

    // deploy the uniswap v2 protocol
    const deploymentResult = await UniswapV2Deployer.deploy(owner);
    factory = deploymentResult.factory;
    router = deploymentResult.router;
    weth9 = deploymentResult.weth9;

    // Deploy the contract as a proxy
    TokenName = await ethers.getContractFactory("TokenName");
    tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);

    // approve the spending (to add liquidity)
    await tokenName.connect(owner).approve(router.address, constants.MaxUint256);

    // add 500 token with 10 eth to liquidity
    await router.addLiquidityETH(
      tokenName.address,
      eth(500),
      eth(500),
      eth(10),
      owner.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    pairAddress = await factory.getPair(tokenName.address, weth9.address)

    // call setPairAddress and setIsWalletLimitUnlimited
    await tokenName.connect(owner).setPairAddress(pairAddress, true);
    await tokenName.connect(owner).setIsWalletLimitUnlimited(pairAddress, true);

    // update the fee recipients
    await tokenName.connect(owner).bulkSetAddresses(
      ownerRecipient.address, marketing.address, dev.address
    );

    // Reset ownerRecipient, marketing and dev wallets to 0
    await network.provider.send("hardhat_setBalance", [
      ownerRecipient.address,
      "0x0",
    ]);
    await network.provider.send("hardhat_setBalance", [
      marketing.address,
      "0x0",
    ]);
    await network.provider.send("hardhat_setBalance", [
      dev.address,
      "0x0",
    ]);
  });

  it('Should apply fees and tax on sells, 4% total', async function () {

    // buy 100 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(100),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(97));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(3));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(1));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(1));

    // approve user 1 to spend token
    await tokenName.connect(user1).approve(router.address, constants.MaxUint256);

    // swap 10 token for eth #2
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(87));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(3.4));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(1.1));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1.1));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(1.1));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0.1));

    // swap 10 token for eth #3
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // swap 10 token for eth #4
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(67));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(4.2));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(1.3));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1.3));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(1.3));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0.3));

    // swap 10 token for eth #5  // triggers the swap and auto lp
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 20000000 }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(57));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(0));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(BigNumber.from("37615121240596619"));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(BigNumber.from("37615121240596619"));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(BigNumber.from("37615121240596619"));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(BigNumber.from("0")); 

    // console log eth balance of user1, marketing, dev and smart contract
    console.log('ETH Balance of ownerRecipient:', await ethers.provider.getBalance(ownerRecipient.address));
    console.log('ETH Balance of marketing:', await ethers.provider.getBalance(marketing.address));
    console.log('ETH Balance of dev:', await ethers.provider.getBalance(dev.address));
  });

  it('Should successfully add auto lp', async function () {

    expect(await weth9.balanceOf(pairAddress)).to.eql(eth(10));
    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(500));

    // buy 100 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(100),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(400));

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(97));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(3));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(1));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(1));

    // approve user 1 to spend token
    await tokenName.connect(user1).approve(router.address, constants.MaxUint256);

    // swap 10 token for eth #2
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(409.6));

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(87));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(3.4));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(1.1));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1.1));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(1.1));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0.1));

    // swap 10 token for eth #3
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // swap 10 token for eth #4
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(428.8));

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(67));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(4.2));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(1.3));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1.3));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(1.3));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0.3));

    // swap 10 token for eth #5  // triggers the swap and auto lp
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 20000000 }
    )

    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(443)); // eth(438.4) + eth(4.6)

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(57));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(0));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(BigNumber.from("37615121240596619"));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(BigNumber.from("37615121240596619"));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(BigNumber.from("37615121240596619"));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(BigNumber.from("0"));
  });

  it('Should apply 8% total. 3%owner, 1%marketing, 2%dev, 2%lp', async function () {

    // call bulkSetFees
    await tokenName.connect(owner).bulkSetFees(3, 1, 2, 2);

    // buy 100 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(100),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(94));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(6));

    // check fees collection
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(3));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1));
    expect(await tokenName.totalDevAmount()).to.eql(eth(2));

    // approve user 1 to spend token
    await tokenName.connect(user1).approve(router.address, constants.MaxUint256);

    // swap 10 token for eth #2
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(84));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(6.8));

    // check fees collection
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(3.3));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1.1));
    expect(await tokenName.totalDevAmount()).to.eql(eth(2.2));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0.2));

    // swap 10 token for eth #3
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // swap 10 token for eth #4
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(64));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(8.4));

    // check fees collection
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(3.9));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1.3));
    expect(await tokenName.totalDevAmount()).to.eql(eth(2.6));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0.6));

    // swap 10 token for eth #5  // triggers the swap and auto lp
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 20000000 }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(54));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(0));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(BigNumber.from("112388390615310396"));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(BigNumber.from("37462796871770132"));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(BigNumber.from("74925593743540264"));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(BigNumber.from("0"));

    // console log eth balance of user1, marketing, dev and smart contract
    console.log('ETH Balance of ownerRecipient:', await ethers.provider.getBalance(ownerRecipient.address));
    console.log('ETH Balance of marketing:', await ethers.provider.getBalance(marketing.address));
    console.log('ETH Balance of dev:', await ethers.provider.getBalance(dev.address));
  });


  it('Should not cause any problem to change fees at any time', async function () {

    // buy 100 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(100),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(97));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(3));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(1));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(1));

    // approve user 1 to spend token
    await tokenName.connect(user1).approve(router.address, constants.MaxUint256);

    // swap 10 token for eth #2
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(87));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(3.4));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(1.1));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1.1));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(1.1));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0.1));

    // call bulkSetFees
    await tokenName.connect(owner).bulkSetFees(3, 1, 2, 2);

    // swap 10 token for eth #3
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // swap 10 token for eth #4
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(67));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(5));      // 3.4 + 0.8 + 0.8

    // check fees collection
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(1.7));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1.3));
    expect(await tokenName.totalDevAmount()).to.eql(eth(1.5));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0.5));

    // swap 10 token for eth #5  // triggers the swap and auto lp
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 20000000 }
    )

    // check token balances
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(57));
    expect(await tokenName.balanceOf(marketing.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(dev.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(ownerRecipient.address)).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(0));

    // check fees collection
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(BigNumber.from("68623599841627635"));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(BigNumber.from("22874533280542545"));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(BigNumber.from("45749066561085090"));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(BigNumber.from("0"));

    // console log eth balance of user1, marketing, dev and smart contract
    console.log('ETH Balance of ownerRecipient:', await ethers.provider.getBalance(ownerRecipient.address));
    console.log('ETH Balance of marketing:', await ethers.provider.getBalance(marketing.address));
    console.log('ETH Balance of dev:', await ethers.provider.getBalance(dev.address));
  });

});

describe('Edge cases', function () {

  let factory;
  let router;
  let weth9;

  let pairAddress;

  beforeEach(async function () {
    // Get signers
    [deployer, owner, ownerRecipient, marketing, dev, user1, user2, anotherPair] = await ethers.getSigners();

    // deploy the uniswap v2 protocol
    const deploymentResult = await UniswapV2Deployer.deploy(owner);
    factory = deploymentResult.factory;
    router = deploymentResult.router;
    weth9 = deploymentResult.weth9;

    // Deploy the contract as a proxy
    TokenName = await ethers.getContractFactory("TokenName");
    tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);

    // approve the spending (to add liquidity)
    await tokenName.connect(owner).approve(router.address, constants.MaxUint256);

    // add 500 token with 10 eth to liquidity
    await router.addLiquidityETH(
      tokenName.address,
      eth(500),
      eth(500),
      eth(10),
      owner.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    pairAddress = await factory.getPair(tokenName.address, weth9.address)

    // call setPairAddress and setIsWalletLimitUnlimited
    await tokenName.connect(owner).setPairAddress(pairAddress, true);
    await tokenName.connect(owner).setIsWalletLimitUnlimited(pairAddress, true);
    
    // update the fee recipients
    await tokenName.connect(owner).bulkSetAddresses(
      ownerRecipient.address, marketing.address, dev.address
    );

    // Reset ownerRecipient, marketing and dev wallets to 0
    await network.provider.send("hardhat_setBalance", [
      ownerRecipient.address,
      "0x0",
    ]);
    await network.provider.send("hardhat_setBalance", [
      marketing.address,
      "0x0",
    ]);
    await network.provider.send("hardhat_setBalance", [
      dev.address,
      "0x0",
    ]);
  });

  it('Should distribute all extra ethers hold by the contract', async function () {

    // buy 100 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(100),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // approve user 1 to spend token
    await tokenName.connect(user1).approve(router.address, constants.MaxUint256);

    // swap 10 token for eth #2
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )
    // swap 10 token for eth #3
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // swap 10 token for eth #4
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(0));

    // someone send 1 eth to the contract
    await owner.sendTransaction({ to: tokenName.address, value: eth(1) });

    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(1));

    // swap 10 token for eth #5  // triggers the swap and auto lp
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 20000000 }
    )

    // assert eth balance
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(BigNumber.from("370948454573929952"));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(BigNumber.from("370948454573929952"));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(BigNumber.from("370948454573929952"));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(BigNumber.from("1"));  // 1 gwei remains because 1 / 3 = 0.3333333333
  });

  it('Should be able to hold any extra tokens', async function () {

    // check token contract balance
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(0));

    // send tokens to the contract
    await tokenName.connect(owner).transfer(tokenName.address, eth(100));

    // check token contract balance
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(100)); 

    // buy 100 token #1
    await router.connect(user1).swapETHForExactTokens(
      eth(100),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    // approve user 1 to spend token
    await tokenName.connect(user1).approve(router.address, constants.MaxUint256);

    // swap 10 token for eth #2
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )
    // swap 10 token for eth #3
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // swap 10 token for eth #4
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(0));

    // someone send 1 eth to the contract
    await owner.sendTransaction({ to: tokenName.address, value: eth(1) });

    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(1));

    // swap 10 token for eth #5  // triggers the swap and auto lp
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 20000000 }
    )

    // assert eth balance
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(BigNumber.from("370948454573929952"));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(BigNumber.from("370948454573929952"));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(BigNumber.from("370948454573929952"));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(BigNumber.from("1"));  // 1 gwei remains because 1 / 3 = 0.3333333333

    // check token contract balance
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(100)); 

    // withdraw tokens
    await tokenName.connect(owner).withdrawToken(eth(100));

    // check token contract balance
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(0));
  });
});


describe('Typical track', function () {

  /**
   * This track has the following tokenomics.
   * - 20% of the supply goes to liquidity
   * - 10% for airdrop
   * - 10% for influencers
   */


  let factory;
  let router;
  let weth9;

  let pairAddress;

  before(async function () {
    // Get signers
    [deployer, owner, ownerRecipient, marketing, dev, user1, user2, user3, user4, influencer1, influencer2, influencer3, influencer4, anotherPair] = await ethers.getSigners();

    // deploy the uniswap v2 protocol
    const deploymentResult = await UniswapV2Deployer.deploy(owner);
    factory = deploymentResult.factory;
    router = deploymentResult.router;
    weth9 = deploymentResult.weth9;

    // Deploy the contract as a proxy
    TokenName = await ethers.getContractFactory("TokenName");
    tokenName = await upgrades.deployProxy(TokenName, [router.address, owner.address]);

    // Reset ownerRecipient, marketing and dev wallets to 0
    await network.provider.send("hardhat_setBalance", [
      ownerRecipient.address,
      "0x0",
    ]);
    await network.provider.send("hardhat_setBalance", [
      marketing.address,
      "0x0",
    ]);
    await network.provider.send("hardhat_setBalance", [
      dev.address,
      "0x0",
    ]);
  });

  it('Should transfer ownership to owner at deployment', async function () {
    expect(await tokenName.owner()).to.eql(owner.address);
  });

  it('Should mint all tokens to owner', async function () {
    expect(await tokenName.balanceOf(owner.address)).to.eql(await tokenName.totalSupply());
  });

  it('Should update the fee recipients', async function () {
    await tokenName.connect(owner).bulkSetAddresses(
      ownerRecipient.address, marketing.address, dev.address
    );
    expect(await tokenName.ownerFeeRecipient()).to.eql(ownerRecipient.address);
    expect(await tokenName.marketingFeeRecipient()).to.eql(marketing.address);
    expect(await tokenName.devFeeRecipient()).to.eql(dev.address);
  });

  it('Should update the fees percentages', async function () {
    await tokenName.connect(owner).bulkSetFees(
      2, 1, 1, 2
    );
    expect(await tokenName.ownerFeePercent()).to.equal(2);
    expect(await tokenName.marketingFeePercent()).to.equal(1);
    expect(await tokenName.devFeePercent()).to.equal(1);
    expect(await tokenName.liquidityFeePercent()).to.equal(2);
  });

  it('Should add 10% of supply to airdrop', async function () {
    await tokenName.connect(owner).depositAirdropTokens(eth(2100000));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000));
    expect(await tokenName.airdropTokens()).to.eql(eth(2100000));
  });

  it('Should add 20% of supply liquidity with 10 ETH', async function () {
    // approve the spending (to add liquidity)
    await tokenName.connect(owner).approve(router.address, constants.MaxUint256);
    // add 4200000 token with 10 eth to liquidity
    // price is then 0,000002381 eth per token
    await router.connect(owner).addLiquidityETH(
      tokenName.address,
      eth(4200000),
      eth(4200000),
      eth(10),
      owner.address,
      constants.MaxUint256,
      { value: eth(10) }
    )

    pairAddress = await factory.getPair(tokenName.address, weth9.address)

    // check the balance of the pair
    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(4200000));
    expect(await weth9.balanceOf(pairAddress)).to.eql(eth(10));
  });

  it('Should add pair address to PairAddress and IsWalletLimitUnlimited mappings', async function () {    
    // call setPairAddress and setIsWalletLimitUnlimited
    await tokenName.connect(owner).setPairAddress(pairAddress, true);
    expect(await tokenName.pairAddress(pairAddress)).to.eql(true);
    await tokenName.connect(owner).setIsWalletLimitUnlimited(pairAddress, true);
    expect(await tokenName.getIsWalletLimitUnlimited(pairAddress)).to.eql(true);
  });

  // Two ways to give tokens to influencers
  // 1. Do normal transfer to influencers
  // 2. Bulk send by calling bulkAirdrop. Should first deposit tokens via depositAirdropTokens
  it('Should send 2% of supply to influencer1', async function () {
    await tokenName.connect(owner).transfer(influencer1.address, eth(420000));
    expect(await tokenName.balanceOf(influencer1.address)).to.eql(eth(420000));

    // for influencer1 to be able to buy more or sell some of his tokens
    // he needs to be isWalletLimitUnlimited
    await tokenName.connect(owner).setIsWalletLimitUnlimited(influencer1.address, true);
  });

  it('Should bulk send 5% of supply to influencer2(1%), influencer3(2%) and influencer4(2%)', async function () {
    await tokenName.connect(owner).depositAirdropTokens(eth(1050000));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 + 1050000));
    expect(await tokenName.airdropTokens()).to.eql(eth(2100000 + 1050000));

    await tokenName.connect(owner).bulkAirdrop(
      [influencer2.address, influencer3.address, influencer4.address],
      [eth(210000), eth(420000), eth(420000)]
    );

    expect(await tokenName.balanceOf(influencer2.address)).to.eql(eth(210000));
    expect(await tokenName.balanceOf(influencer3.address)).to.eql(eth(420000));
    expect(await tokenName.balanceOf(influencer4.address)).to.eql(eth(420000));

    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000));
    expect(await tokenName.airdropTokens()).to.eql(eth(2100000));

    // better give them setIsWalletLimitUnlimited so they wont be able to easily buy or sell
    await tokenName.connect(owner).setIsWalletLimitUnlimited(influencer2.address, true);
    await tokenName.connect(owner).setIsWalletLimitUnlimited(influencer3.address, true);
    await tokenName.connect(owner).setIsWalletLimitUnlimited(influencer4.address, true);
  });

  it('#1 user1 should buy 1000 tokens', async function () {
    await router.connect(user1).swapETHForExactTokens(
      eth(1000),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(1) }
    )

    // check balance of user1 & pair
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(960));
    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(4199000));

    // check that fees are accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(20));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(10));
    expect(await tokenName.totalDevAmount()).to.eql(eth(10));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 + 40));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(0)); 
  });

  it('#2 user2 should buy 2000 tokens', async function () {
    await router.connect(user2).swapETHForExactTokens(
      eth(2000),
      [weth9.address, tokenName.address],
      user2.address,
      constants.MaxUint256,
      { value: eth(1) }
    )

    // check balance of user2 & pair
    expect(await tokenName.balanceOf(user2.address)).to.eql(eth(1920));
    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(4197000));

    // check that fees are accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(60));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(30));
    expect(await tokenName.totalDevAmount()).to.eql(eth(30));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 + 120));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(0)); 
  });

  it('#3 influencer1 should sell 100000 tokens', async function () {
    await tokenName.connect(influencer1).approve(router.address, constants.MaxUint256);
    await router.connect(influencer1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(100000),
      0,
      [tokenName.address, weth9.address],
      influencer1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check balance of influencer1 & pair
    expect(await tokenName.balanceOf(influencer1.address)).to.eql(eth(320000));
    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(4291000));

    // check that fees are accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(2060));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1030));
    expect(await tokenName.totalDevAmount()).to.eql(eth(1030));
    expect(await tokenName.totalLiquidity()).to.eql(eth(2000));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 + 6120));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(0)); 
  });


  it('#4 user1 should buy 3000 tokens', async function () {
    await router.connect(user1).swapETHForExactTokens(
      eth(3000),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(1) }
    )

    // check balance of user1 & pair
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(960 + 2880));
    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(4288000));

    // check that fees are accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(2120));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(1060));
    expect(await tokenName.totalDevAmount()).to.eql(eth(1060));
    expect(await tokenName.totalLiquidity()).to.eql(eth(2000));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 + 6240));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(0)); 
  });

  it('#5 user3 should buy 110000 tokens', async function () {
    await router.connect(user3).swapETHForExactTokens(
      eth(110000),
      [weth9.address, tokenName.address],
      user3.address,
      constants.MaxUint256,
      { value: eth(100) }
    )

    // check balance of user3 & pair
    expect(await tokenName.balanceOf(user3.address)).to.eql(eth(105600));
    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(4178000));

    // check that fees are accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(4320));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(2160));
    expect(await tokenName.totalDevAmount()).to.eql(eth(2160));
    expect(await tokenName.totalLiquidity()).to.eql(eth(2000));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 + 10640));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(0)); 
  });

  it('user3 buy 110000 tokens, should revert', async function () {
    await expect(
      router.connect(user3).swapETHForExactTokens(
        eth(110000),
        [weth9.address, tokenName.address],
        user3.address,
        constants.MaxUint256,
        { value: eth(1000), gasLimit: 1000000 }
      )).to.be.reverted;
  });
    
  it('#6 user4 should buy 110000 tokens', async function () {
    await router.connect(user4).swapETHForExactTokens(
      eth(110000),
      [weth9.address, tokenName.address],
      user4.address,
      constants.MaxUint256,
      { value: eth(100) }
    )

    // check balance of user3 & pair
    expect(await tokenName.balanceOf(user4.address)).to.eql(eth(105600));
    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(4068000));

    // check that fees are accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(6520));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(3260));
    expect(await tokenName.totalDevAmount()).to.eql(eth(3260));
    expect(await tokenName.totalLiquidity()).to.eql(eth(2000));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 + 15040));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(0)); 
  });

  it('user4 can\'t transfer tokens to user3 due to walletLimit', async function () {
    // user4 try to send them to user3 but fails because of walletLimit
    await expect(
      tokenName.connect(user4).transfer(user3.address, eth(104401))
    ).to.be.revertedWith("ExceedsWalletLimit");
  });

  it('influencer1 can\'t transfer tokens to user3 due to walletLimit', async function () {
    // influencer1 try to send them to user3 but fails because of walletLimit
    await expect(
      tokenName.connect(influencer1).transfer(user3.address, eth(104401))
    ).to.be.revertedWith("ExceedsWalletLimit");
  });

  it('#7 #8 user1 should buy 2 times 1000 tokens', async function () {
    await router.connect(user1).swapETHForExactTokens(
      eth(1000),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(1) }
    )
    await router.connect(user1).swapETHForExactTokens(
      eth(1000),
      [weth9.address, tokenName.address],
      user1.address,
      constants.MaxUint256,
      { value: eth(1) }
    )

    // check balance of user1 & pair
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(960 + 2880 + 1920));
    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(4066000));

    // check that fees are accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(6560));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(3280));
    expect(await tokenName.totalDevAmount()).to.eql(eth(3280));
    expect(await tokenName.totalLiquidity()).to.eql(eth(2000));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 + 15120));
    
    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(eth(0));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(eth(0)); 
  });

  it('#8 influencer1 should sell tokens', async function () {
    await router.connect(influencer1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(100000),
      0,
      [tokenName.address, weth9.address],
      influencer1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check balance of influencer1
    expect(await tokenName.balanceOf(influencer1.address)).to.eql(eth(220000));

    // check that fees are accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(BigNumber.from("21589201583079422"));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(BigNumber.from("10794600791539711"));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(BigNumber.from("10794600791539711"));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(BigNumber.from("2"));  // 2 is the leftover, it'll be distributed next distribution

    expect(await tokenName.balanceOf(pairAddress)).to.eql(eth(4181120)); // eth(4066000) + eth(94000) + eth(21120)

    // print balances
    console.log("ownerRecipient ETH balance: " + ethers.utils.formatEther(await ethers.provider.getBalance(ownerRecipient.address)));
    console.log("marketing ETH balance: " + ethers.utils.formatEther(await ethers.provider.getBalance(marketing.address)));
    console.log("de ETH balancev: " + ethers.utils.formatEther(await ethers.provider.getBalance(dev.address)));
  });

  it('Should airdrop tokens', async function () {
    await tokenName.connect(owner).bulkAirdrop([user1.address, user2.address, user3.address], [eth(1000), eth(2000), eth(3000)]);
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(960 + 2880 + 1920 + 1000));
    expect(await tokenName.balanceOf(user2.address)).to.eql(eth(1920 + 2000));
    expect(await tokenName.balanceOf(user3.address)).to.eql(eth(105600 + 3000));

    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 - 6000));
    expect(await tokenName.airdropTokens()).to.eql(eth(2100000 - 6000));
  });

  it('Should set all fees to zero', async function () {
    await tokenName.connect(owner).bulkSetFees(0, 0, 0, 0);
    expect(await tokenName.ownerFeePercent()).to.eql(0);
    expect(await tokenName.marketingFeePercent()).to.eql(0);
    expect(await tokenName.devFeePercent()).to.eql(0);
    expect(await tokenName.liquidityFeePercent()).to.eql(0);
  });
  
  it('#1 user1 should sell tokens', async function () {
    await tokenName.connect(user1).approve(router.address, constants.MaxUint256);
    await router.connect(user1).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(1000),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check balance of user1
    expect(await tokenName.balanceOf(user1.address)).to.eql(eth(960 + 2880 + 1920));

    // check that fees are not accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 - 6000));
  });

  it('#2 user3 should sell tokens', async function () {
    await tokenName.connect(user3).approve(router.address, constants.MaxUint256);
    await router.connect(user3).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10000),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check balance of user1
    expect(await tokenName.balanceOf(user3.address)).to.eql(eth(105600 + 3000 - 10000));

    // check that fees are not accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 - 6000));
  });

  it('#3 user3 should sell tokens', async function () {
    await router.connect(user3).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10000),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check balance of user1
    expect(await tokenName.balanceOf(user3.address)).to.eql(eth(105600 + 3000 - 20000));

    // check that fees are not accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 - 6000));
  });

  it('#4 user3 should sell tokens', async function () {
    await router.connect(user3).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10000),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check balance of user1
    expect(await tokenName.balanceOf(user3.address)).to.eql(eth(105600 + 3000 - 30000));

    // check that fees are not accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 - 6000));
  });

  it('#5 user3 should sell tokens', async function () {
    await router.connect(user3).swapExactTokensForTokensSupportingFeeOnTransferTokens(
      eth(10000),
      0,
      [tokenName.address, weth9.address],
      user1.address,
      constants.MaxUint256,
      { gasLimit: 2000000 }
    )

    // check balance of user1
    expect(await tokenName.balanceOf(user3.address)).to.eql(eth(105600 + 3000 - 40000));

    // check that fees are not accumulating
    expect(await tokenName.totalOwnerAmount()).to.eql(eth(0));
    expect(await tokenName.totalMarketingAmount()).to.eql(eth(0));
    expect(await tokenName.totalDevAmount()).to.eql(eth(0));
    expect(await tokenName.totalLiquidity()).to.eql(eth(0));
    expect(await tokenName.balanceOf(tokenName.address)).to.eql(eth(2100000 - 6000));

    // check eth balances
    expect(await ethers.provider.getBalance(ownerRecipient.address)).to.eql(BigNumber.from("21589201583079422"));
    expect(await ethers.provider.getBalance(marketing.address)).to.eql(BigNumber.from("10794600791539711"));
    expect(await ethers.provider.getBalance(dev.address)).to.eql(BigNumber.from("10794600791539711"));
    expect(await ethers.provider.getBalance(tokenName.address)).to.eql(BigNumber.from("2"));  // 2 is the leftover, it'll be distributed next distribution

    console.log("ownerRecipient ETH balance: " + ethers.utils.formatEther(await ethers.provider.getBalance(ownerRecipient.address)));
    console.log("marketing ETH balance: " + ethers.utils.formatEther(await ethers.provider.getBalance(marketing.address)));
    console.log("de ETH balancev: " + ethers.utils.formatEther(await ethers.provider.getBalance(dev.address)));
  });
});
