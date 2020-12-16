pragma solidity ^0.6.0;
// SPDX-License-Identifier: UNLICENCED
import "./ColorCoinBase.sol";

/// @title Smart contract for Color Coin token.
/// @notice Color is the next generation platform for high-performance sophisticated decentralized applications (dApps). https://www.colors.org/
/// @dev Not intended for reuse.
contract ColorCoin is ColorCoinBase {
  /// @notice Token name
  string public constant name = "Color Coin";

  /// @notice Token symbol
  string public constant symbol = "COL";

  /// @notice Precision in fixed point arithmetics
  uint8 public constant decimals = 18;

  /// @notice Initialises a newly created instance
  /// @param _totalSupply Total amount of Color Coin tokens available.
  /// @param _founder Address of the founder wallet
  /// @param _admin Address of the admin wallet
  constructor(uint256 _totalSupply,
    address payable _founder,
    address _admin,
    uint256 _mintSpeed
  ) public ColorCoinBase (_totalSupply, _founder, _admin, _mintSpeed)
  {
  }
}
