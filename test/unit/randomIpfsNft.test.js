const { assert, expect } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Ipfs Nft Unit test", () => {
          let vrfCoordinatorV2Mock, randomIpfsNft, deployer
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["mocks", "randomIpfsNft"])
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
          })

          describe("constructor", () => {
              it("Intialize Nft Correctly", async () => {
                  const lionTokenUriAtZero = await randomIpfsNft.getLionTokenUris(0)
                  assert(lionTokenUriAtZero.includes("ipfs://"))
                  //   const isInitialize = await randomIpfsNft.getInitialized()
                  //   assert.equal(isInitialize, true)
              })
          })

          describe("requestNft", () => {
              it("fails if enough mint fee isn't paid", async () => {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNft__NeedMoreETHSent"
                  )
              })

              it("reverts if payment amount is less than mint fee", async () => {
                  const mintFee = await randomIpfsNft.getMintFee()

                  await expect(
                      randomIpfsNft.requestNft({
                          value: mintFee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWithCustomError(randomIpfsNft, "RandomIpfsNft__NeedMoreETHSent")
              })

              it("emits event if nft is requested", async () => {
                  const mintFee = await randomIpfsNft.getMintFee()
                  await expect(randomIpfsNft.requestNft({ value: mintFee.toString() })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })

          describe("fulfillRandomWords", () => {
              it("create nft after receiving random number", async () => {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfsNft.getLionTokenUris(0)
                              const owner = await randomIpfsNft.ownerOf("0")

                              assert.equal(tokenUri.toString().includes("ipfs://"), true)
                              assert.equal(owner, deployer.address)
                              resolve()
                          } catch (error) {
                              reject(error)
                          }
                      })

                      try {
                          const mintFee = await randomIpfsNft.getMintFee()
                          const nftRequestedResponse = await randomIpfsNft.requestNft({
                              value: mintFee,
                          })
                          const nftRequestedReceipt = await nftRequestedResponse.wait(1)

                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              nftRequestedReceipt.events[1].args.requestId,
                              randomIpfsNft.address
                          )
                      } catch (error) {
                          reject(error)
                      }
                  })
              })
          })

          describe("getBreedFromModdedRing", () => {
              it("should return charlie if modderng is less than 10", async () => {
                  const expectedValue = await randomIpfsNft.getBreedFromModdedRng(7)
                  assert.equal(0, expectedValue)
              })

              it("should return charlie if modderng is between 10-30", async () => {
                  const expectedValue = await randomIpfsNft.getBreedFromModdedRng(16)
                  assert.equal(1, expectedValue)
              })

              it("should return charlie if modderng is between 30-99", async () => {
                  const expectedValue = await randomIpfsNft.getBreedFromModdedRng(70)
                  assert.equal(2, expectedValue)
              })

              it("should revert if modedrng > 99", async () => {
                  //   const expectedValue = await randomIpfsNft.getBreedFromModdedRng(400)
                  //   console.log(expectedValue)
                  await expect(
                      randomIpfsNft.getBreedFromModdedRng(100)
                  ).to.be.revertedWithCustomError(randomIpfsNft, "RandomIpfsNft__RangeOutOfBounds")
              })
          })
      })
