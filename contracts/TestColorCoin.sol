pragma solidity ^0.6.0;
// SPDX-License-Identifier: UNLICENCED
import "./ColorCoin.sol";

contract TestColorCoin is ColorCoin {

	constructor(uint256 _totalSupply,
		address payable _founder,
		address _admin,
		uint256 _mintingSpeed,
		uint256 _pixelCoinSupply,
		address _pixelAccount
	) public
		ColorCoin(_totalSupply, _founder, _admin, _mintingSpeed, _pixelCoinSupply, _pixelAccount)
	{
	}

	function accountBalance(address who) public view returns (uint) {
		return accounts[who];
	}

	function getIsInvestor(address who) public view returns (bool) {
		return hasLockup(who);
	}

	function getInvestor(address who) public view returns (uint initial, uint period, uint locked) {
		initial = investors[who].initialAmount;
		period = investors[who].currentLockUpPeriod;
		locked = investors[who].lockedAmount;
	}

	function getLockUpSize(address who) public view returns (uint) {
		return investors[who].lockUpPeriods.length;
	}

	function getUnlockData(address who, uint i) public view returns (uint date, uint amount) {
		date = investors[who].lockUpPeriods[i].unlockDate;
		amount = investors[who].lockUpPeriods[i].amount;
	}

	function tryToUnlock(address who) public {
		tryUnlock(who);
	}
}
