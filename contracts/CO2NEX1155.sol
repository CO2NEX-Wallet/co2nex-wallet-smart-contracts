// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CO2NEX1155 is ERC1155, Ownable {
    uint256 public constant CARBON = 1;
    uint256 public constant WATER = 2;
    uint256 public constant BIODIVERSITY = 3;

    constructor() ERC1155("https://api.co2nex.com/metadata/{id}.json") {}

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }
}
