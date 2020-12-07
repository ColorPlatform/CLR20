pragma solidity ^0.5.0;

import "./ColorCoin.sol";

contract TransferCLR {
    ColorCoin public clr;
    address internal owner;

    constructor(ColorCoin addr) public {
        clr = addr;
        owner = msg.sender;
    }

    function transfer(address from , address to, uint256 amount) public returns (bool) {
        require(msg.sender == owner, "Only owner can use this contract");

        return clr.transferFrom(from, to, amount);
    }
    function transfer_Batch(address from , 
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
}