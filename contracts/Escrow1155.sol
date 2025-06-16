// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

contract Escrow1155 is Ownable, ReentrancyGuard, ERC1155Receiver {
    IERC1155 public token;

    // Mapping: user => tokenID => balance
    mapping(address => mapping(uint256 => uint256)) private balances;

    // 🔥 Events for front-end & monitoring
    event Deposited(address indexed user, uint256 indexed tokenId, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed tokenId, uint256 amount);
    event TokenAddressUpdated(address indexed newTokenAddress);

    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Token address cannot be zero");
        token = IERC1155(_tokenAddress);
    }

    // ✅ Deposit tokens into escrow
    function deposit(uint256 tokenId, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        // Transfer tokens from user to escrow contract
        token.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        // Update internal balance mapping
        balances[msg.sender][tokenId] += amount;

        emit Deposited(msg.sender, tokenId, amount);
    }

    // ✅ Withdraw tokens from escrow
    function withdraw(uint256 tokenId, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        uint256 userBalance = balances[msg.sender][tokenId];
        require(userBalance >= amount, "Not enough balance in escrow");

        balances[msg.sender][tokenId] -= amount;

        token.safeTransferFrom(address(this), msg.sender, tokenId, amount, "");

        emit Withdrawn(msg.sender, tokenId, amount);
    }

    // ✅ View balance in escrow for a user and token ID
    function balanceOf(address user, uint256 tokenId) external view returns (uint256) {
        return balances[user][tokenId];
    }

    // ✅ Admin function to change token contract if needed (in emergencies or upgrades)
    function setTokenAddress(address newToken) external onlyOwner {
        require(newToken != address(0), "Invalid token address");
        token = IERC1155(newToken);
        emit TokenAddressUpdated(newToken);
    }

    // ✅ Required for ERC1155 safe transfers
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) public pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) public pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId) || interfaceId == type(IERC1155Receiver).interfaceId;
    }
}
