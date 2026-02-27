const { network } = require("hardhat")
const {FUNDING_DEADLINE,networkConfig,CONFIRMATIONS} = require("../helper-hardhat-config")
//function deployFunction(){

//}
//module.exports.default=deployFunction
module.exports = async({getNamedAccounts,deployments}) => {
    const {firstAccount} = await getNamedAccounts()
    const {deploy} = deployments
    let dataFeedAddr
    let confirmations
    if(network.name == "hardhat"){
        dataFeedAddr = (await deployments.get("MockV3Aggregator")).address
        confirmations = 0
    }else{
        
        dataFeedAddr =networkConfig[network.config.chainId].ethUsdDataFeed
        confirmations = CONFIRMATIONS
    }
    
    const fundMe = await deploy("FundMe",{
        from:firstAccount,
        args:[FUNDING_DEADLINE,dataFeedAddr],
        log: true,
        waitConfirmations:confirmations
    })
    if(hre.network.config.chainId == 11155111 && process.env.API_KEY){
            
            await hre.run("verify:verify",{

                address: fundMe.address,
                constructorArguments:[FUNDING_DEADLINE,dataFeedAddr],
            });
        }else{
            console.log("verification skipped..")
        }
    
}

module.exports.tags = ["all","fundme"]