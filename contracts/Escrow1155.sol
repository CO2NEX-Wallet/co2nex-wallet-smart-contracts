// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract Escrow1155 is ERC165 {
    address public owner;
    IERC1155 public token;

    struct Deal {
        uint256 tokenId;
        uint256 amount;
        address buyer;
        address seller;
        bool isReleased;
    }

    uint256 public dealCount;
    mapping(uint256 => Deal) public deals;

    event DealCreated(uint256 indexed dealId, address indexed buyer, address indexed seller, uint256 tokenId, uint256 amount);
    event DealReleased(uint256 indexed dealId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address tokenAddress) {
        owner = msg.sender;
        token = IERC1155(tokenAddress);
    }

    function createDeal(address seller, uint256 tokenId, uint256 amount) external {
        token.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        dealCount++;
        deals[dealCount] = Deal({
            tokenId: tokenId,
            amount: amount,
            buyer: msg.sender,
            seller: seller,
            isReleased: false
        });

        emit DealCreated(dealCount, msg.sender, seller, tokenId, amount);
    }

    function releaseDeal(uint256 dealId) external {
        Deal storage deal = deals[dealId];
        require(!deal.isReleased, "Deal already released");
        require(msg.sender == deal.buyer || msg.sender == owner, "Not authorized");

        deal.isReleased = true;
        token.safeTransferFrom(address(this), deal.seller, deal.tokenId, deal.amount, "");

        emit DealReleased(dealId);
    }
}
