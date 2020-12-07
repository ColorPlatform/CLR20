pragma solidity ^0.6.0;

// SPDX-License-Identifier: UNLICENCED

abstract contract ERC20 {

    // Get the total token supply
    function totalSupply() public virtual view returns (uint256);

    // Get the account balance of another account with address _owner
    function balanceOf(address who) public virtual view returns (uint256);

    // Send _value amount of tokens to address _to
    function transfer(address to, uint256 value) public virtual returns (bool);

    // Send _value amount of tokens from address _from to address _to
    function transferFrom(address from, address to, uint256 value) public virtual returns (bool);

    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    // this function is required for some DEX functionality
    function approve(address spender, uint256 value) public virtual returns (bool);

    // Returns the amount which _spender is still allowed to withdraw from _owner
    function allowance(address owner, address spender) public virtual view returns (uint256);

    // Triggered when tokens are transferred.
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Triggered whenever approve(address _spender, uint256 _value) is called.
    event Approval(address indexed owner,address indexed spender,uint256 value);
}
