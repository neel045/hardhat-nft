const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET

const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)

    let responses = []

    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try {
            console.log("deploying")
            console.log(readableStreamForFile.path)

            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response.IpfsHash)
        } catch (error) {
            console.log(error)
        }
    }

    console.log(responses)

    return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (e) {
        console.log(e)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }
