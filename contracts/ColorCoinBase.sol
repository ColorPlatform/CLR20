pragma solidity ^0.6.0;
// SPDX-License-Identifier: UNLICENCED
import "./lib/Suspendable.sol";

/// @title Advanced functions for Color Coin token smart contract.
/// @notice Implements functions for private ICO and super users.
/// @dev Not intended for reuse.
contract ColorCoinBase is _Suspendable {

  /// @dev Represents a lock-up period.
  struct LockUp {
    // @dev end of the period, in seconds since the epoch.
    uint256 unlockDate;
    // @dev amount of coins to be unlocked at the end of the period.
    uint256 amount;
  }

  /// @dev Represents a wallet with lock-up periods.
  struct Investor {
    // @dev initial amount of locked COLs
    uint256 initialAmount;
    // @dev current amount of locked COLs
    uint256 lockedAmount;
    // @dev current lock-up period, index in the array `lockUpPeriods`
    uint256 currentLockUpPeriod;
    // @dev the list of lock-up periods
    LockUp[] lockUpPeriods;
  }

  /// @notice The event that is fired when a lock-up period expires for a certain wallet.
  /// @param  who the wallet where the lock-up period expired
  /// @param  period  the number of the expired period
  /// @param  amount  amount of unlocked coins.
  event Unlock(address who, uint256 period, uint256 amount);

  /// @notice The event that is fired when a super user makes transfer.
  /// @param  from the wallet, where COLs were withdrawn from
  /// @param  to  the wallet, where COLs were deposited to
  /// @param  requestedAmount  amount of coins, that the super user requested to transfer
  /// @param  returnedAmount  amount of coins, that were actually transferred
  /// @param  reason  the reason, why super user made this transfer
  event SuperAction(address from, address to, uint256 requestedAmount, uint256 returnedAmount, string reason);

  /// @dev  set of wallets with lock-up periods
  mapping (address => Investor) internal investors;

  /// @dev wallet with the supply of Color Coins.
  ///   It is used to calculate circulating supply.
  address internal supply;
  /// @dev amount of Color Coins locked in lock-up wallets.
  ///   It is used to calculate circulating supply.
  uint256 internal totalLocked;

  /// @notice Sets total supply and the addresses of super users - founder and admin.
  /// @param _totalSupply Total amount of Color Coin tokens available.
  /// @param _founder Address of the founder wallet
  /// @param _admin Address of the admin wallet
  constructor(uint256 _totalSupply,
    address payable _founder,
    address _admin,
    uint256 _mintingSpeed
  ) public _Suspendable (_totalSupply, _founder, _admin, _mintingSpeed)
  {
    supply = founder;
  }

  //
  // ERC20 spec.
  //

  /// @notice Returns the balance of a wallet.
  ///   For wallets with lock-up the result of this function inludes both free floating and locked COLs.
  /// @param _owner The address of a wallet.
  function balanceOf(address _owner) override public view returns (uint256) {
    return accounts[_owner] + investors[_owner].lockedAmount;
  }

  /// @dev Performs transfer from one wallet to another.
  ///   The maximum amount of COLs to transfer equals to `balanceOf(_from) - getLockedAmount(_from)`.
  ///   This function unlocks COLs if any of lock-up periods expired at the moment
  ///   of the transaction execution.
  ///   Calls `Suspendable._transfer` to do the actual transfer.
  ///   This function is used by ERC20 `transfer` function.
  /// @param  _from   wallet from which tokens are withdrawn.
  /// @param  _to   wallet to which tokens are deposited.
  /// @param  _value  amount of COLs to transfer.
  function _transfer(address _from, address _to, uint256 _value) override 
  internal returns (bool) {
    if (hasLockup(_from)) {
      tryUnlock(_from);
    }
    return super._transfer(_from, _to, _value);
  }

  /// @notice The founder sends COLs to early investors and sets lock-up periods.
  ///   Initially all distributed COL's are locked.
  /// @dev  Only founder can call this function.
  /// @param _to  address of the wallet that receives the COls.
  /// @param _value amount of COLs that founder sends to the investor's wallet.
  /// @param unlockDates array of lock-up period dates.
  ///   Each date is in seconds since the epoch. After `unlockDates[i]` is expired,
  ///   the corresponding `amounts[i]` amount of COLs gets unlocked.
  ///   After expiring the last date in this array all COLs become unlocked.
  /// @param amounts array of COL amounts to unlock.
  function distribute(address _to, uint256 _value,
      uint256[] memory unlockDates, uint256[] memory amounts
    ) onlyFounder public returns (bool) {
    // We distribute invested coins to new wallets only
    require(balanceOf(_to) == 0);
    require(_value <= accounts[founder]);
    require(unlockDates.length == amounts.length);

    // We don't check that unlock dates strictly increase.
    // That doesn't matter. It will work out in tryUnlock function.

    // We don't check that amounts in total equal to _value.
    // tryUnlock unlocks no more that _value anyway.

    investors[_to].initialAmount = _value;
    investors[_to].lockedAmount = _value;
    investors[_to].currentLockUpPeriod = 0;

    for (uint256 i=0; i<unlockDates.length; i++) {
      investors[_to].lockUpPeriods.push(LockUp(unlockDates[i], amounts[i]));
    }

    // ensureLockUp(_to);
    accounts[founder] -= _value;
    emit Transfer(founder, _to, _value);
    totalLocked = totalLocked.add(_value);
    // Check the lock-up periods. If the leading periods are 0 or already expired
    // unlock corresponding coins.
    tryUnlock(_to);
    return true;
  }

  /// @notice Returns `true` if the wallet has locked COLs
  /// @param _address address of the wallet.
  /// @return `true` if the wallet has locked COLs and `false` otherwise.
  function hasLockup(address _address) public view returns(bool) {
    return (investors[_address].lockedAmount > 0);
  }

  //
  // Unlock operations
  //

  /// @dev tells whether the wallet still has lockup and number of seconds until unlock date.
  /// @return locked if `locked` is true, the wallet still has a lockup period, otherwise all lockups expired.
  /// @return seconds amount of time in seconds until unlock date. Zero means that it has expired,
  ///   and the user can invoke `doUnlock` to release corresponding coins.
  function _nextUnlockDate(address who) internal view returns (bool, uint256) {
    if (!hasLockup(who)) {
      return (false, 0);
    }

    uint256 i = investors[who].currentLockUpPeriod;
    // This must not happen! but still...
    // If all lockup periods have expired, but there are still locked coins,
    // tell the user to unlock.
    if (i == investors[who].lockUpPeriods.length) return (true, 0);

    if (now < investors[who].lockUpPeriods[i].unlockDate) {
      // If the next unlock date is in the future, return the number of seconds left
      return (true, investors[who].lockUpPeriods[i].unlockDate - now);
    } else {
      // The current unlock period has expired.
      return (true, 0);
    }
  }

  /// @notice tells the wallet owner whether the wallet still has lockup and number of seconds until unlock date.
  /// @return locked if `locked` is true, the wallet still has a lockup period, otherwise all lockups expired.
  /// @return seconds amount of time in seconds until unlock date. Zero means that it has expired,
  ///   and the user can invoke `doUnlock` to release corresponding coins.
  function nextUnlockDate() public view returns (bool, uint256) {
    return _nextUnlockDate(msg.sender);
  }

  /// @notice tells to the admin whether the wallet still has lockup and number of seconds until unlock date.
  /// @return locked if `locked` is true, the wallet still has a lockup period, otherwise all lockups expired.
  /// @return seconds amount of time in seconds until unlock date. Zero means that it has expired,
  ///   and the user can invoke `doUnlock` to release corresponding coins.
  function nextUnlockDate_Admin(address who) public view superuser returns (bool, uint256) {
    return _nextUnlockDate(who);
  }

  /// @notice the wallet owner signals that the next unlock period has passed, and some coins could be unlocked
  function doUnlock() public {
    tryUnlock(msg.sender);
  }

  /// @notice admin unlocks coins in the wallet, if any
  /// @param who the wallet to unlock coins
  function doUnlock_Admin(address who) public superuser {
    tryUnlock(who);
  }
  /// @notice Returns the amount of locked coins in the wallet.
  ///   This function tells the amount of coins to the wallet owner only.
  /// @return amount of locked COLs by `now`.
  function getLockedAmount() public view returns (uint256) {
    return investors[msg.sender].lockedAmount;
  }

  /// @notice Returns the amount of locked coins in the wallet.
  /// @return amount of locked COLs by `now`.
  function getLockedAmount_Admin(address who) public view onlyAdmin returns (uint256) {
    return investors[who].lockedAmount;
  }

  function tryUnlock(address _address) internal {
    if (!hasLockup(_address)) {
      return ;
    }

    uint256 amount = 0;
    uint256 i;
    uint256 start = investors[_address].currentLockUpPeriod;
    uint256 end = investors[_address].lockUpPeriods.length;

    for ( i = start;
          i < end;
          i++)
    {
      if (investors[_address].lockUpPeriods[i].unlockDate <= now) {
        amount += investors[_address].lockUpPeriods[i].amount;
      } else {
        break;
      }
    }

    if (i == investors[_address].lockUpPeriods.length) {
      // all unlock periods expired. Unlock all
      amount = investors[_address].lockedAmount;
    } else if (amount > investors[_address].lockedAmount) {
      amount = investors[_address].lockedAmount;
    }

    if (amount > 0 || i > start) {
      investors[_address].lockedAmount = investors[_address].lockedAmount.sub(amount);
      investors[_address].currentLockUpPeriod = i;
      accounts[_address] = accounts[_address].add(amount);
      emit Unlock(_address, i, amount);
      totalLocked = totalLocked.sub(amount);
    }
  }

  //
  // Admin privileges - return coins in the case of errors or theft
  //

  /// @notice Super user (founder or admin) unconditionally transfers COLs from one account to another.
  ///   This function is designed as the last resort in the case of mistake or theft.
  ///   Superuser provides verbal description of the reason to perform this operation.
  ///  @dev   Only superuser can call this function.
  /// @param from   the wallet, where COLs were withdrawn from
  /// @param to   the wallet, where COLs were deposited to
  /// @param amount  amount of coins transferred
  /// @param reason   description of the reason, why super user invokes this transfer
  function adminTransfer(address from, address to, uint256 amount, string memory reason) public virtual superuser {
    if (amount == 0) return;
    require(from != founder, "Founder account: use ordinary transfer");

    uint256 requested = amount;
    // Revert as much as possible
    if (accounts[from] < amount) {
      amount = accounts[from];
    }

    accounts[from] -= amount;
    accounts[to] = accounts[to].add(amount);
    emit SuperAction(from, to, requested, amount, reason);
  }

  //
  // Circulating supply
  //

  /// @notice Returns the circulating supply of Color Coins.
  ///   It consists of all unlocked coins in user wallets.
  function circulatingSupply() public virtual view returns(uint256) {
    return __totalSupply.sub(accounts[supply]).sub(totalLocked);
  }

  //
  // Release contract
  //

  /// @notice Calls `selfdestruct` operator and transfers all Ethers to the founder (if any)
  function destroy() public onlyFounder {
    selfdestruct(founder);
  }
}
