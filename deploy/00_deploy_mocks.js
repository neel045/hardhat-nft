const { developmentChains } = require("../helper-hardhat-config")

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

        log("Mocks Deployed ")
        log("_____________________________________________")
    }
}

module.exports.tags = ["all", "mocks", "main"]
