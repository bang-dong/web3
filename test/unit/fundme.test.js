const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert,expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

describe("test fundme contract",async function(){
    let fundMe
    let fundMeSecondAccount
    let firstAccount
    let secondAccount
    let MockV3Aggregator
    beforeEach(async function() {
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount =(await getNamedAccounts()).secondAccount
        const fundMeDeployment = await deployments.get("FundMe")
        MockV3Aggregator = await deployments.get("MockV3Aggregator")
        fundMe = await ethers.getContractAt("FundMe",fundMeDeployment.address)
        fundMeSecondAccount = await ethers.getContract("FundMe",secondAccount)

    })
    
    it("test if the owner is msg.sender",async function() {
        //const fundMeFactory = await ethers.getContractFactory("FundMe")
        //const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()
        //const [firstAccount] = await ethers.getSigners()
        await assert.equal((await fundMe.owner()),firstAccount)
    })
    
        it("test if the datafeed is assigned correctly",async function() {
        //const fundMeFactory = await ethers.getContractFactory("FundMe")
        //const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()
        await assert.equal((await fundMe.dataFeed()),MockV3Aggregator.address)
    })

    //fund getFund reFund
    //unit test for fund
    it("window closed,value grater than minimun,fund failed",async function(){
        await helpers.time.increase(181)
        await helpers.mine()
        await expect(fundMe.fund({value: ethers.parseEther("0.1")}))
            .to.be.revertedWith("window is closed")

    })

    it("window open,value is less than minimun,fund failed",async function(){
        await helpers.time.increase(18)
        await helpers.mine()
        await expect(fundMe.fund({value: ethers.parseEther("0.01")}))
            .to.be.revertedWith("send more ETH")
    })

    it("window open,value grater than minimun,fund success",async function(){
        await helpers.time.increase(18)
        await helpers.mine()
        await fundMe.fund({value: ethers.parseEther("0.1")})
        const balance = await fundMe.addressToAmountFunded(firstAccount)
        await expect(balance).to.equal("100000000000000000")

    })

    //unit test for getFund

    it("not owner, window close ,value grater than target,getfund failed",async function(){
        
        await fundMe.fund({value: ethers.parseEther("1")})
        await helpers.time.increase(181)
        await helpers.mine()
        await expect(fundMeSecondAccount.getFund())
            .to.be.revertedWith("you not is owner")

    })

    it("owner, window open ,value grater than target,getfund failed",async function(){
        
        await fundMe.fund({value: ethers.parseEther("1")})
        await helpers.time.increase(18)
        await helpers.mine()
        await expect(fundMe.getFund())
            .to.be.revertedWith("window is open")

    })


    it("owner, window closed ,target not reached,getfund failed",async function(){
        
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await helpers.time.increase(181)
        await helpers.mine()
        await expect(fundMe.getFund())
            .to.be.revertedWith("the value less then fund goal")

    })

    it("owner, window closed ,value grater than target,getfund success",async function(){
        
        await fundMe.fund({value: ethers.parseEther("1")})
        await fundMeSecondAccount.fund({value: ethers.parseEther("1")})
        await helpers.time.increase(190)
        await helpers.mine()
        await expect(fundMe.getFund())
            .to.emit(fundMe,"FundWithdrawByOwner")
            .withArgs(ethers.parseEther("2"))

    })
   
    
    //unit test for reFund

    it("window close ,value grater than target,refund failed",async function(){
        
        await fundMe.fund({value: ethers.parseEther("1")})
        await helpers.time.increase(181)
        await helpers.mine()
        await expect(fundMe.getRefund())
            .to.be.revertedWith("the value not to you")

    })

    it("window open ,target not reached,refund failed",async function(){
        
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await helpers.time.increase(18)
        await helpers.mine()
        await expect(fundMe.getRefund())
            .to.be.revertedWith("window is open")

    })


    it("window closed ,target not reached,funder not has balance,refund failed",async function(){
        
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await helpers.time.increase(181)
        await helpers.mine()
        await fundMe.getRefund()
        await expect(fundMe.getRefund())
            .to.be.revertedWith("there is no fund for you")

    })

    it("window closed ,target not reached,funder not has balance,refund success",async function(){
        
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await fundMeSecondAccount.fund({value: ethers.parseEther("0.05")})
        await helpers.time.increase(190)
        await helpers.mine()
        await expect(fundMe.getRefund())
            .to.emit(fundMe,"ReFundByuser")
            .withArgs(firstAccount,ethers.parseEther("0.1"))

    })
})