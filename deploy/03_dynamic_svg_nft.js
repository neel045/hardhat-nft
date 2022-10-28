const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const EthUsedAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUsedAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    log("----------------------------------------------")
    const lowSVG = await fs.readFileSync("./nft_files/dynamicNft/frown.svg", { encoding: "utf8" })
    const highSVG = await fs.readFileSync("./nft_files/dynamicNft/happy.svg", { encoding: "utf8" })

    const args = [ethUsdPriceFeedAddress, lowSVG, highSVG]

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("----------------------------------------------")
    log("Verifying..........")
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(dynamicSvgNft.address, args)
    }
    log("----------------------------------------------")
}

module.exports.tags = ["all", "dynamicsvg", "main"]
