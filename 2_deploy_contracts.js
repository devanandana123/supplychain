// 2_deploy_contracts.js
const SupplyChain = artifacts.require("SupplyChain");

module.exports = function (deployer) {
    deployer.deploy(SupplyChain);
};
