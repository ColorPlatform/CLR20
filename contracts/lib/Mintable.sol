pragma solidity ^0.5.0;

import "./Base20.sol";

contract _Mintable is _Base20 {
  uint256 internal __mintSpeed;
  uint internal    _mintLast;

  /// @notice Sets total supply and the addresses of super users - founder and admin.
  /// @param _totalSupply Total amount of Color Coin tokens available.
  /// @param _founder Address of the founder wallet
  /// @param _admin Address of the admin wallet
  /// @param _mintSpeed Amount of coins to mint per second
  constructor(uint256 _totalSupply,
    address payable _founder,
    address _admin,
    uint256 _mintSpeed) public _Base20(_totalSupply, _founder, _admin)
  {
      __mintSpeed = _mintSpeed;
      _mintLast = block.timestamp;
  }

  function getMintSpeed() public view returns (uint256) {
      return __mintSpeed;
  }
  function setMintSpeed(uint256 _mintSpeed) public onlyFounder {
      _mint();  // Mint up to now
      __mintSpeed = _mintSpeed;
  }

  function _mint() internal {
      uint256 coins = __mintSpeed*(block.timestamp - _mintLast);
      if (coins > 0) {
        accounts[founder] += coins;
        __totalSupply += coins;
        emit Transfer(address(0), founder, coins);
      }
  }
  function mint() public onlyFounder {
      _mint();
  }

  function increaseSupply(uint256 coins) public onlyFounder {
      _mint();
      if (coins > 0) {
        accounts[founder] += coins;
        __totalSupply += coins;
        emit Transfer(address(0), founder, coins);
      }
  }

  function decreaseSupply(uint256 coins) public onlyFounder {
      _mint();
      if (coins > 0) {
        require(coins <= accounts[founder]);

        accounts[founder] -= coins;
        __totalSupply -= coins;
        emit Transfer(founder, address(0), coins);
      }
  }
  function _transfer(address _from, address _to, uint256 _value)
  internal returns (bool) {
      _mint();
      return super._transfer(_from, _to, _value);
  }

}