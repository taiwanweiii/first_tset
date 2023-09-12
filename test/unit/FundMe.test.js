const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChian } = require("../../helper-hardhat-config")
const { assert, expect } = require('chai')
!developmentChian.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
        let fundMe
        let deployer
        let mockv3Aggregator
        const sendValue = ethers.parseEther('10') //"10000000000000000000" //1 ETH  

        beforeEach(async () => {
            // deploy our fundMe contract
            //const accounts = await ethers.getsigners()
            // const accountZero = accounts[0]
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(['all'])
            fundMe = await ethers.getContract('FundMe', deployer)
            // console.log(fundMe)
            mockv3Aggregator = await ethers.getContract('MockV3Aggregator', deployer)
            // console.log(mockv3Aggregator)
        })
        describe('constructor', async () => {
            it('set the aggregator addresses correctly', async () => {
                const response = await fundMe.getPriceFeed()
                assert.equal(response, mockv3Aggregator.target)
            })
        })
        describe("fund", async () => {
            it("Fails is you don't send enough ETH", async () => {
                await expect(fundMe.fund()).to.be.revertedWith(
                    "You need to spend more ETH!"
                )
            })
            it("updated the amount funded data structure", async () => {
                await fundMe.fund({ value: sendValue })
                const response = await (fundMe.getaddressToAmountFunded(deployer))
                console.log(response.toString())
                assert.equal(response.toString(), sendValue.toString())
            })
            it('add funder to array of funders', async function () {
                await fundMe.fund({ value: sendValue })
                const funder = await fundMe.getFunders(0)
                assert.equal(funder, deployer)
            })
        })
        describe('withdraw', async => {
            beforeEach(async () => {
                await fundMe.fund({ value: sendValue })
            })
            it("withdraw ETH from a single founder", async () => {
                //Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                //Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, gasPrice } = transactionReceipt
                const GasCost = gasUsed * gasPrice
                const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)
                //Assert 
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance + (startingDeployerBalance), endingDeployerBalance + (GasCost))
            })
            it('allows us to withdraw with mulitiple funders', async () => {
                const accounts = await ethers.getSigners();
                for (i = 1; i < 6; i++) {
                    const fundMeConnectedContracct = await fundMe.connect(accounts[i])
                    await fundMeConnectedContracct.fund({ value: sendValue })
                }
                //Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                //Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, gasPrice } = transactionReceipt
                const GasCost = gasUsed * gasPrice
                const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)
                //Assert 
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance + (startingDeployerBalance), endingDeployerBalance + (GasCost))
                //Make sure that the funders are reset properly
                await expect(fundMe.getFunders(0)).to.be.rejected
                for (i = 1; i < 6; i++)
                    assert.equal(await fundMe.getaddressToAmountFunded(accounts[i].address), 0)
            })
            it('only allows the owner to withdraw', async () => {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const atttackerConnectedContract = await fundMe.connect(attacker)
                await expect(atttackerConnectedContract.withdraw()).to.be.rejectedWith("FundMe__NotOwner")
            })

            it('cheaperWithdraw testing...', async () => {
                const accounts = await ethers.getSigners();
                for (i = 1; i < 6; i++) {
                    const fundMeConnectedContracct = await fundMe.connect(accounts[i])
                    await fundMeConnectedContracct.fund({ value: sendValue })
                }
                //Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                //Act
                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, gasPrice } = transactionReceipt
                const GasCost = gasUsed * gasPrice
                const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)
                //Assert 
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance + (startingDeployerBalance), endingDeployerBalance + (GasCost))
                //Make sure that the funders are reset properly
                await expect(fundMe.getFunders(0)).to.be.rejected
                for (i = 1; i < 6; i++)
                    assert.equal(await fundMe.getaddressToAmountFunded(accounts[i].address), 0)
            })
            it("cheaperWithdraw ETH from a single founder", async () => {
                //Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                //Act
                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, gasPrice } = transactionReceipt
                const GasCost = gasUsed * gasPrice
                const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)
                //Assert 
                assert.equal(endingFundMeBalance, 0)
                assert.equal(startingFundMeBalance + (startingDeployerBalance), endingDeployerBalance + (GasCost))
            })
        })
    })