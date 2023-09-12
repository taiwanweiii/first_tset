const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChian } = require("../../helper-hardhat-config")
const { assert, expect } = require('chai')

developmentChian.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
        let fundMe
        let deployer
        const sendValue = "100000000"//ethers.parseEther('10') //"10000000000000000000" //1 ETH  

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract('FundMe', deployer)
        })

        it('allows people to fund and withdraw', async function () {
            await fundMe.fund({ value: sendValue })
            // await fundMe.withdraw()
            const endingBalance = await ethers.provider.getBalance(fundMe.target)
            assert.equal(endingBalance.toString(), "0")
        })

    })
