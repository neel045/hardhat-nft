const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")
require("dotenv").config()

const imagesLocation = "./nft_files/images"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "violance",
            value: 100,
        },
    ],
}
let tokenUris = [
    "ipfs://QmUeMWbGCUMbXdmRJGgmx4WWKNkrb8GgQiaQdT7YRRbosQ",
    "ipfs://Qmd59LfmgqfeVmq8gXqGBR8N8CzKxoxodFGwZfQMmY8cX7",
    "ipfs://QmVCK5BiRwNYpum49dXqzjL2KeQ7DPaPDH3mJUAXLXMjE8",
]

const FUND_AMOUNT = "100000000000000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let vrfCoordinatorV2Mock, vrfCoordinatorV2Address, subscriptionId

    //get IPFS hashes of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("------------------------------------------")

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    })

    if (developmentChains.includes(network.name) && chainId === 31337) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId.toNumber(), randomIpfsNft.address)
    }

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(randomIpfsNft.address, args)
    }
}

async function handleTokenUris() {
    tokenUris = []
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)

    for (imageUploadResponseIndex in imageUploadResponses) {
        //create meta data
        //upload metadata

        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".jpg", "")
        tokenUriMetadata.description = `An violant and brave protector ${tokenUriMetadata.name} lion`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex]}`
        console.log(`Uploading.....${tokenUriMetadata.name}`)
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        // console.log(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomIpfsNft", "main"]
