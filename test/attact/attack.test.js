// test/attack.test.js
const { expect } = require("chai");
const { ethers, deployments} = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers")

describe("FundMe Attack Test Suite", function () {
    let fundMe, attack, owner, user, attacker, oracle, attackerContract;

    beforeEach(async () => {
        [owner, user, attacker] = await ethers.getSigners();

        // Mock Oracle（ETH = 20000 USD）
        const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
        oracle = await MockV3Aggregator.deploy(8,200000000000);

        // 部署 FundMe
        const FundMe = await ethers.getContractFactory("FundMe");
        fundMe = await FundMe.deploy(3600, oracle.target);

        // 部署攻击合约
        const Attack = await ethers.getContractFactory("AttackReentrancy");
        attack = await Attack.deploy(fundMe.target);
        


    });

    // -----------------------------
    // 1. 重入攻击测试
    // -----------------------------
    it("should exploit reentrancy in getRefund", async () => {
        // 普通用户存钱
        await fundMe.connect(user).fund({
            value: ethers.parseEther("0.05"),
        });

        await attack.deposit({ value: ethers.parseEther("0.1") });
        await helpers.time.increase(3610)
        await helpers.mine()
        // 攻击
        await attack.attack();
        
        const fundBalance = await ethers.provider.getBalance(fundMe.target);

        console.log("FundMe balance:", fundBalance.toString());

        // 如果被攻击，余额会减少甚至为 0
        expect(fundBalance).to.be.equal(ethers.parseEther("0.05"));
    });

    // -----------------------------
    // 2. 权限测试
    // -----------------------------
    it("should prevent non-owner from calling getFund", async () => {
        await expect(
            fundMe.connect(user).getFund()
        ).to.be.reverted;
    });

    // -----------------------------
    // 3. 精度攻击测试
    // -----------------------------
    it("should detect precision issue", async () => {
        // 设置极低价格:100USD
        await expect(
            fundMe.connect(user).fund({
                value: ethers.parseEther("0.05"),
            })
        ).to.not.be.reverted; // 可能绕过
    });

    // -----------------------------
    // 4. DoS 攻击测试
    // -----------------------------
    it("should cause DoS via reentrancy attack", async function () {
    // 普通用户先存钱（提供资金池）
        await fundMe.connect(user).fund({
        value: ethers.parseEther("1"),
        });

        // 攻击者存钱
        await attack.deposit({
            value: ethers.parseEther("0.1"),
        });

        //时间推进
        await helpers.time.increase(3610)
        await helpers.mine()

        //发起攻击 → 预期 DoS（revert）
        await expect(
            attack.attack()
        ).to.be.reverted;
    });

    // -----------------------------
    // 5. 跨合约一致性测试
    // -----------------------------
    it("should keep mapping and token consistent", async () => {
        const Token = await ethers.getContractFactory("FundTokenERC20");
        const token = await Token.deploy(fundMe.target);

        // 设置 ERC20 权限
        await fundMe.setERC20(token.target);

        // 用户出资
        await fundMe.connect(user).fund({
            value: ethers.parseEther("1"),
        });

        // 模拟众筹完成
        await helpers.time.increase(3610)
        await helpers.mine()
        await fundMe.connect(owner).getFund();
  
        // mint token
        await token.connect(user).mint(ethers.parseEther("0.6"));

        const token_balance = await token.balanceOf(user.address);
        const balance = await fundMe.addressToAmountFunded(user.address);
        expect(token_balance).to.equal(ethers.parseEther("0.6"));
        expect(balance).to.equal(ethers.parseEther("0.4"));
    });
});