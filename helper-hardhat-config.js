const DECIMAL = 8
const INITIAL_ANSWER = 300000000000
const FUNDING_DEADLINE = 180

const networkConfig = {
    11155111:{
        //web3 dataFeed address : 0x694AA1769357215DE4FAC081bf1f309aDC325306
        ethUsdDataFeed:"0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
}
const CONFIRMATIONS = 5

module.exports ={
    DECIMAL,
    INITIAL_ANSWER,
    FUNDING_DEADLINE,
    networkConfig,
    CONFIRMATIONS
}