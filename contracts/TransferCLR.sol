pragma solidity ^0.6.0;
// SPDX-License-Identifier: UNLICENCED
import "./ColorCoin.sol";

contract TransferCLR {
    ColorCoin public clr;
    address payable internal owner;

    constructor(ColorCoin addr) public {
        clr = addr;
        owner = msg.sender;
    }

    /// @notice Transfers Color Coins from `from` wallet to the specified destination.
    function transfer(address from , address to, uint256 amount) public returns (bool) {
        require(msg.sender == owner, "Only owner can use this contract");

        return clr.transferFrom(from, to, amount);
    }

    /// @notice Transfers Color Coins from `from` wallet to multiple destinations.
    function transfer_Batch(address from, 
            address[] memory destinations, 
            uint256[] memory amounts
    ) public {
        require(msg.sender == owner, "Only owner can use this contract");

        require(amounts.length == destinations.length, "Invalid data");
        
        for (uint256 i = 0; i < destinations.length; i++) {
            address dst = destinations[i];
            uint256 amount = amounts[i];
            transfer(from, dst, amount);
        }
    }

    /// @notice Calls `selfdestruct` operator and transfers all Ethers to the contract owner
    function destroy() public {
        require(msg.sender == owner, "Only owner can destroy this contract");
        selfdestruct(owner);
    }
}