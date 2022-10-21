// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNft is ERC721 {
    uint256 private s_tokenCounter;
    string public constant TOKEN_URI =
        "ipfs://bafybeiezjpkl4eo5iwkvdpe65kzp3cb2a5ym4jvxrt6fzask2jakqphfl4/";

    constructor() ERC721("Simha", "TIGER") {
        s_tokenCounter = 0;
    }

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }

    function tokenURI(
        uint256 /*tokenId*/
    ) public view override returns (string memory) {
        return TOKEN_URI;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
