pragma solidity ^0.5.0;

import "./Mintable.sol";

/// @title Admin can suspend specific wallets in cases of misbehaving or theft.
/// @notice This contract implements methods to lock tranfers, either globally or for specific accounts.
contract _Suspendable is _Mintable {
  /// @dev flag whether transfers are allowed on global scale.
  ///    When `isTransferable` is `false`, all transfers between wallets are blocked.
  bool internal isTransferable = false;
  /// @dev set of suspended wallets.
  ///   When `suspendedAddresses[wallet]` is `true`, the `wallet` can't both send and receive COLs.
  mapping(address => bool) internal suspendedAddresses;

  /// @notice Sets total supply and the addresses of super users - founder and admin.
  /// @param _totalSupply Total amount of Color Coin tokens available.
  /// @param _founder Address of the founder wallet
  /// @param _admin Address of the admin wallet
  constructor(uint256 _totalSupply,
    address payable _founder,
    address _admin,
    uint256 _mintSpeed) public _Mintable(_totalSupply, _founder, _admin, _mintSpeed)
  {
  }

  /// @dev specifies that the marked method could be used only when transfers are enabled.
  ///   Founder can always transfer
  modifier transferable {
    require(isTransferable || msg.sender == founder);
    _;
  }

  /// @notice Getter for the global flag `isTransferable`.
  /// @dev Everyone is allowed to view it.
  function isTransferEnabled() public view returns (bool) {
    return isTransferable;
  }

  /// @notice Enable tranfers globally.
  ///   Note that suspended acccounts remain to be suspended.
  /// @dev Sets the global flag `isTransferable` to `true`.
  function enableTransfer() onlyAdmin public {
    isTransferable = true;
  }

  /// @notice Disable tranfers globally.
  ///   All transfers between wallets are blocked.
  /// @dev Sets the global flag `isTransferable` to `false`.
  function disableTransfer() onlyAdmin public {
    isTransferable = false;
  }

  /// @notice Check whether an address is suspended.
  /// @dev Everyone can check any address they want.
  /// @param _address wallet to check
  /// @return returns `true` if the wallet `who` is suspended.
  function isSuspended(address _address) public view returns(bool) {
    return suspendedAddresses[_address];
  }

  /// @notice Suspend an individual wallet.
  /// @dev Neither the founder nor the admin could be suspended.
  /// @param who  address of the wallet to suspend.
  function suspend(address who) onlyAdmin public {
    if (who == founder || who == admin) {
      return;
    }
    suspendedAddresses[who] = true;
  }

  /// @notice Unsuspend an individual wallet
  /// @param who  address of the wallet to unsuspend.
  function unsuspend(address who) onlyAdmin public {
    suspendedAddresses[who] = false;
  }

  //
  // Update of ERC20 functions
  //

  /// @dev Internal function for transfers updated.
  ///   Neither source nor destination of the transfer can be suspended.
  function _transfer(address _from, address _to, uint256 _value) internal returns (bool) {
    require(!isSuspended(_to));
    require(!isSuspended(_from));

    return super._transfer(_from, _to, _value);
  }

  /// @notice `transfer` can't happen when transfers are disabled globally
  /// @dev added modifier `transferable`.
  function transfer(address _to, uint256 _value) public transferable returns (bool) {
    return _transfer(msg.sender, _to, _value);
  }

  /// @notice `transferFrom` can't happen when transfers are disabled globally
  /// @dev added modifier `transferable`.
  function transferFrom(address _from, address _to, uint256 _value) public transferable returns (bool) {
    require(!isSuspended(msg.sender));
    return super.transferFrom(_from, _to, _value);
  }

  // ERC20 spec.
  /// @notice `approve` can't happen when transfers disabled globally
  ///   Suspended users are not allowed to do approvals as well.
  /// @dev  Added modifier `transferable`.
  function approve(address _spender, uint256 _value) public transferable returns (bool) {
    require(!isSuspended(msg.sender));
    return super.approve(_spender, _value);
  }

  // /// @notice Change founder. New founder must not be suspended.
  // function changeFounder(address payable who) onlyFounder public {
  //   require(!isSuspended(who));
  //   super.changeFounder(who);
  // }

  /// @notice Change admin. New admin must not be suspended.
  function changeAdmin(address who) public {
    require(!isSuspended(who));
    super.changeAdmin(who);
  }
}
