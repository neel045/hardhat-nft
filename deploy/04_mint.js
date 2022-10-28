const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()

    //basic Nft
    const basicNft = await ethers.getContract("BasicNft", deployer)
    const basicNftTx = await basicNft.mintNft()
    await basicNftTx.wait(1)
    console.log(`Basic NFT has TokenUri: ${await basicNft.tokenURI(0)}`)

    // Random IPFS NFT
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 500000)
        randomIpfsNft.once("NftMinted", async () => {
            resolve()
        })
        const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
        const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })

    console.log(`Random Ipfs Nft index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)} `)

    //dyamic SVG NFT
    const highValue = ethers.utils.parseEther("300")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue.toString())
    await dynamicSvgNftMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 1 tokenURI:${await dynamicSvgNft.tokenURI(1)}`)
}

module.exports.tags = ["all", "mint", "main"]
