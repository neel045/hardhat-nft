const { ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const DECIMALS = "18"
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether")

module.exports = async (hre) => {
    const { deployments, getNamedAccounts, network, ethers } = hre
    const BASE_FEE = ethers.utils.parseEther("0.25")
    const GAS_PRICE_LINK = 1e9

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args,
            log: true,
        })

        await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMALS, INITIAL_PRICE],
            log: true,
        })

        log("Mocks Deployed ")
        log("_____________________________________________")
    }
}

module.exports.tags = ["all", "mocks", "main"]
