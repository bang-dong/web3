# 🧱 FundMe - 去中心化众筹协议
一个基于 Ethereum 的去中心化众筹智能合约。  
用户可以使用 ETH 进行资金支持，只有合约所有者可以提取资金。
提取资金完成后，用户可根据自己的资金金额换取相应兼容性代币

## 🚀 功能特性
- 支持 ETH 资金投入
- 基于 USD 的最小出资限制（通过 Chainlink 预言机）
- 仅合约所有者可提取资金
- 提供 Gas 优化的 withdraw 实现
- 完整单元测试覆盖

## 🏗 系统架构
              Contract Owner
                    ↑
User（用户） → FundMe Contract → mapping(address => amount) → mint FT
                      ↓
             Chainlink Oracle

## 🔑 核心合约设计
1️⃣ 资金记录机制
solidity
   mapping(address => uint256) public addressToAmountFunded;
设计原因：
  支持 O(1) 时间复杂度查询用户资金
  相比数组遍历更加节省 Gas
2️⃣ 最小出资限制（USD）
集成 Chainlink Price Feed
实现 ETH → USD 实时转换
设计目的：
  避免 ETH 价格波动导致的资金不足问题
  提升协议稳定性
🔒 安全性设计
使用 onlyOwner 限制提现权限
输入参数校验（最小出资）
避免不必要的外部调用
🧪 测试
测试框架：
  Hardhat
  Mocha
  Chai
测试覆盖率
  ✅ 90%+
核心测试用例
  正常出资流程
  小于最小金额 → revert
  多用户出资
  owner 提现
  非 owner 提现失败
🛠 技术栈
Solidity
Hardhat
Ethers.js
Chainlink

## 📌 项目总结
使用 mapping 高效管理用户资金
集成 Chainlink 实现真实价格校验
构建高覆盖率测试体系（接近生产级）


