// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DynamicSvgNft is ERC721 {
    //Nft variables
    uint256 public s_tokenCounter;
    string private i_lowImageURI;
    string private i_highImageURI;

    //mint
    //Store svg data somewhere
    //Some logic to say "show x image" or "show y image"
    constructor(string memory lowSvg, string memory highSvg) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
    }

    function svgToImageURI() private {}

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
    }
}
