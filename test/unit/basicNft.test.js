const { assert, expect } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft unit test", () => {
          let deployer, basicNft

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["basicNft"])
              basicNft = await ethers.getContract("BasicNft", deployer)
          })

          describe("constructor", () => {
              it("intitalize nft correctly", async () => {
                  const name = await basicNft.name()
                  const symbol = await basicNft.symbol()
                  const tokenCounter = await basicNft.getTokenCounter()

                  assert.equal(name, "Simha")
                  assert.equal(symbol, "TIGER")
                  assert.equal(tokenCounter.toString(), "0")
              })
          })

          describe("Mint Nft", () => {
              beforeEach(async () => {
                  const txResponse = await basicNft.mintNft()
                  await txResponse.wait(1)
              })

              it("allwos users to mint NFT and updates details correctly", async () => {
                  const tokenURI = await basicNft.tokenURI(0)
                  const tokenCounter = await basicNft.getTokenCounter()

                  expect(tokenURI).to.equal(await basicNft.TOKEN_URI())
                  assert.equal(tokenCounter.toString(), "1")
              })

              it("shows correct balance and owner of NFT", async () => {
                  const deployerAddress = deployer.address
                  const deployerBalance = await basicNft.balanceOf(deployerAddress)
                  const owner = await basicNft.ownerOf("0")

                  assert.equal(deployerBalance.toString(), "1")
                  assert.equal(owner, deployerAddress)
              })
          })
      })
