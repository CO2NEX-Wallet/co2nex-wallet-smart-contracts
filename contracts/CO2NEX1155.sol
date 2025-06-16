// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CO2NEX1155 is ERC1155Supply, Ownable, Pausable {
    // 🔥 Token IDs
    uint256 public constant CARBON = 1;
    uint256 public constant WATER = 2;
    uint256 public constant BIODIVERSITY = 3;

    constructor() ERC1155("https://api.co2nex.com/metadata/{id}.json") {}

    // ✅ Mint single token (onlyOwner)
    function mint(
        address account, 
        uint256 id, 
        uint256 amount, 
        bytes memory data
    ) public onlyOwner whenNotPaused {
        _mint(account, id, amount, data);
    }

    // ✅ Mint batch of tokens (onlyOwner)
    function mintBatch(
        address to, 
        uint256[] memory ids, 
        uint256[] memory amounts, 
        bytes memory data
    ) public onlyOwner whenNotPaused {
        _mintBatch(to, ids, amounts, data);
    }

    // ✅ Burn single token (optionally allow users to burn their own)
    function burn(
        address account, 
        uint256 id, 
        uint256 value
    ) public whenNotPaused {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()), 
            "Not authorized to burn"
        );
        _burn(account, id, value);
    }

    // ✅ Burn batch (optional)
    function burnBatch(
        address account, 
        uint256[] memory ids, 
        uint256[] memory values
    ) public whenNotPaused {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()), 
            "Not authorized to burn"
        );
        _burnBatch(account, ids, values);
    }

    // ✅ Emergency pause/unpause
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // ✅ Override required to support Pausable
    function _beforeTokenTransfer(
        address operator, 
        address from, 
        address to, 
        uint256[] memory ids, 
        uint256[] memory amounts, 
        bytes memory data
    ) internal override(ERC1155Supply) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
