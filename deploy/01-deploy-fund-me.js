//import 


//main function

//calling of main function
// function deployFunc() {
//     console.log('hi')
// }
const { networkConfig, developmentChian } = require("../helper-hardhat-config")
// const networkConfig = helpnetworkConfig.networkConfig
const { network } = require('hardhat')
const { verify } = require("../utils/verify")
require("dotenv").config()


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // const ethUsdPricefeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPricefeedAddress
    if (developmentChian.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPricefeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPricefeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log(ethUsdPricefeedAddress + '測試')
    log(`ChanID: ${network.name} network detected! Deploying..`)
    log(`---------------------------------------`)
    const fundMe = await deploy("FundMe", {
        from: deployer,
        log: true,
        args: [ethUsdPricefeedAddress],
        waitConfirmations: network.config.blockConfirmations || 1,

    })
    log('test network deployed')
    log('-----------------------------')

    if (!developmentChian.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, [ethUsdPricefeedAddress])
    }
}
module.exports.tags = ['all', 'Fundme']