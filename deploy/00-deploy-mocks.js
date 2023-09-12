const hardhat = require('hardhat')
const { developmentChian, DECIMALS, INITTAL_ANSWER } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = hardhat.network.config.chainId
    log(hardhat.network.name)
    if (developmentChian.includes(network.name)) {
        log("Local network detected! Deploying mocks..")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITTAL_ANSWER]
        })
        log('Mocks deployed')
        log('-----------------------------')
    }
}

module.exports.tags = ['all', 'mocks']