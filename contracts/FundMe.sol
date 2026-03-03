// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

//创建一个收款函数
//记录投资人并且查看
//锁定期内，达到目标值，生产商提款
//锁定期内，未达到目标值，退款

contract FundMe{
    mapping ( address => uint256) public addressToAmountFunded;
    uint256 public minimumUSD = 100 * 10 ** 18; // 100 USD
    uint256 public constant FUNDING_GOAL_IN_USD = 500 * 10 ** 18; // 500 USD
    uint256 public FUNDING_DEADLINE;
    uint256 public FUNDING_TIMESTAMP;
    address public owner;
    address ERC20addr;
    AggregatorV3Interface public dataFeed;
    bool public fundingComplete;
    event FundWithdrawByOwner(uint256);
    event ReFundByuser(address, uint256);

    constructor(uint256 _FUNDING_DEADLINE, address DATAFEED){
        owner = msg.sender;
        FUNDING_DEADLINE = _FUNDING_DEADLINE;
        FUNDING_TIMESTAMP = block.timestamp;
        //web3 dataFeed address : 0x694AA1769357215DE4FAC081bf1f309aDC325306
        dataFeed = AggregatorV3Interface(DATAFEED);

    }
    
    modifier onlyowner(){
        require(msg.sender == owner,"you not is owner");
        _;
    }
    modifier afterDeadline() {
        require(block.timestamp > FUNDING_TIMESTAMP + FUNDING_DEADLINE,"window is open");
        _;
    }
    
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8);
    }

    function fund() external payable {
        require(block.timestamp < FUNDING_TIMESTAMP + FUNDING_DEADLINE, "window is closed");
        require(convertEthToUsd(msg.value) >= minimumUSD,"send more ETH");
        addressToAmountFunded[msg.sender] += msg.value;
    }
    function getFund() public afterDeadline onlyowner{
        require(convertEthToUsd(address(this).balance) >= FUNDING_GOAL_IN_USD,"the value less then fund goal");
        bool success;
        uint256 balance = address(this).balance;
        (success,)=payable (msg.sender).call{value:balance}("");
       //payable (msg.sender).transfer(address(this).balance);
        fundingComplete = true;
        //emit event
        emit FundWithdrawByOwner(balance);
    }
    function getRefund() public afterDeadline{
        require(convertEthToUsd(address(this).balance) < FUNDING_GOAL_IN_USD,"the value not to you");
        require(addressToAmountFunded[msg.sender] != 0, "there is no fund for you");
        bool success;
        uint256 balance = addressToAmountFunded[msg.sender];
        (success,)= payable(msg.sender).call{value:balance}("");
        //payable (msg.sender).transfer(addressToAmountFunded[msg.sender]);
        addressToAmountFunded[msg.sender] = 0 ;
        //emit event
        emit ReFundByuser(msg.sender, balance);
    }

    function setowner(address newOwner) public onlyowner{
        owner = newOwner;
    }

    function setERC20(address _erc20) public onlyowner{
        ERC20addr = _erc20;
    }

    function setAddressToAmount(address _address, uint256 _amountupdate) external {
        require(msg.sender == ERC20addr,"you do not have permission to call this function");
        addressToAmountFunded[_address] = _amountupdate;
    }
    
}