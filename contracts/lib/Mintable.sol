pragma solidity ^0.6.0;
// SPDX-License-Identifier: UNLICENCED
import "./Base20.sol";

contract _Mintable is _Base20 {
  uint256 internal __mintingSpeed;
  uint internal    _mintLast;

  /// @notice Sets total supply and the addresses of super users - founder and admin.
  /// @param _totalSupply Total amount of Color Coin tokens available.
  /// @param _founder Address of the founder wallet
  /// @param _admin Address of the admin wallet
  /// @param _mintingSpeed Amount of coins to mint per second
  constructor(uint256 _totalSupply,
    address payable _founder,
    address _admin,
    uint256 _mintingSpeed) public _Base20(_totalSupply, _founder, _admin)
  {
      __mintingSpeed = _mintingSpeed;
      _mintLast = block.timestamp;
  }

  function getMintingSpeed() public view returns (uint256) {
      return __mintingSpeed;
  }
  function setMintingSpeed(uint256 _mintingSpeed) public onlyFounder {
      _mint();  // Mint up to now
      __mintingSpeed = _mintingSpeed;
  }
  function stopMinting() public onlyFounder {
    __mintingSpeed = 0;
  }

  function expectedMint() public view returns (uint256) {
    if (block.timestamp < _mintLast || __mintingSpeed == 0) {
      return 0;
    }

    return __mintingSpeed.mul(block.timestamp - _mintLast);
  }

  function _mint() internal returns (uint256) {
      uint256 coins = expectedMint();
      if (coins > 0) {
        accounts[founder] = accounts[founder].add(coins);
        __totalSupply = __totalSupply.add(coins);
        _mintLast = block.timestamp;

        emit Minted(coins);
      }
      return coins;
  }

  function mint() public returns (uint256) {
      return _mint();
  }

  function increaseSupply(uint256 coins) public onlyFounder {
      _mint();
      if (coins > 0) {
        accounts[founder] += coins;
        __totalSupply += coins;
        emit SupplyIncreased(coins);
        emit Transfer(address(0), founder, coins);
      }
  }

  function decreaseSupply(uint256 coins) public onlyFounder {
      _mint();
      if (coins > 0) {
        require(coins <= accounts[founder], "Not enough funds in the founder's account");

        accounts[founder] -= coins;
        __totalSupply -= coins;
        emit SupplyDecreased(coins);
        emit Transfer(founder, address(0), coins);
      }
  }

  function _transfer(address _from, address _to, uint256 _value) override virtual
  internal returns (bool) {
      _mint();
      return super._transfer(_from, _to, _value);
  }

  event Minted(uint256 amount);
  event SupplyIncreased(uint256 increase);
  event SupplyDecreased(uint256 decrease);
}