pragma solidity ^0.6.0;
// SPDX-License-Identifier: UNLICENCED
import "./lib/ERC20.sol";

/// @title Dedicated methods for Pixel program
/// @notice Pixels are a type of “airdrop” distributed to all Color Coin wallet holders,
///   five Pixels a day. They are awarded on a periodic basis. Starting from Sunday GMT 0:00,
///   the Pixels have a lifespan of 24 hours. Pixels in their original form do not have any value.
///   The only way Pixels have value is by sending them to other wallet holders.
///   Pixels must be sent to another person’s account within 24 hours or they will become void.
///   Each user can send up to five Pixels to a single account per week. Once a wallet holder receives Pixels,
///   the Pixels will become Color Coins. The received Pixels may be converted to Color Coins
///   on weekly basis, after Saturday GMT 24:00.
/// @dev Pixel distribution might require thousands and tens of thousands transactions.
///   The methods in this contract consume less gas compared to batch transactions.
contract Pixel {

  address internal pixelAdmin;
  address payable internal founder;
  
  ERC20 internal coinContract;

  /// @dev The rate to convert pixels to Color Coins
  uint256 internal pixelConvRate;

  /// @dev Methods could be called by either the founder of the dedicated account.
  modifier pixel {
    require(msg.sender == pixelAdmin || msg.sender == founder, "Only Pixel founder or admin can do this");
    _;
  }

  /// @notice Initialises a newly created instance.
  constructor(
    ERC20 _coinContract,
    address _pixelAdmin
  ) public 
  {
    coinContract = _coinContract;
    pixelAdmin = _pixelAdmin;

    founder = msg.sender;
  }

  function getFounder() public view returns(address) {
    return founder;
  }

  function getAdmin() public view returns(address) {
    return pixelAdmin;
  }

  function setAdmin(address newAdmin) public {
    require(msg.sender == founder, "Only founder can change admins");
    pixelAdmin = newAdmin;
  }


  /// @notice Founder or the pixel admin set the pixel conversion rate.
  ///   Pixel team first sets this conversion rate and then start sending COLs
  ///   in exchange of pixels that people have received.
  /// @dev This rate is used in `sendCoinsForPixels` functions to calculate the amount
  ///   COLs to transfer to pixel holders.
  function setPixelConversionRate(uint256 _pixelConvRate) public pixel {
    pixelConvRate = _pixelConvRate;
  }

  /// @notice Get the conversion rate that was used in the most recent exchange of pixels to COLs.
  function getPixelConversionRate() public view returns (uint256) {
    return pixelConvRate;
  }

  /// @notice Distribute COL coins for pixels
  ///   COLs are spent from `Pixel` wallet. The amount of COLs is equal to `getPixelConversionRate() * pixels`
  /// @dev Only pixel admin and founder can invoke this function.
  /// @param pixels       Amount of pixels to exchange into COLs
  /// @param destination  The wallet that holds the pixels.
  function sendCoinsForPixels(
    uint32 pixels, address destination
  ) public pixel {
    uint256 coins = pixels*pixelConvRate;
    if (coins == 0) return;

    coinContract.transferFrom(address(this), destination, coins);
  }

  /// @notice Distribute COL coins for pixels to multiple users.
  ///   This function consumes less gas compared to a batch transaction of `sendCoinsForPixels`.
  ///   `pixels[i]` specifies the amount of pixels belonging to `destinations[i]` wallet.
  ///   COLs are spent from `pixelAccount` wallet. The amount of COLs sent to i-th wallet is equal to `getPixelConversionRate() * pixels[i]`
  /// @dev Only founder and pixel account can invoke this function.
  /// @param pixels         Array of pixel amounts to exchange into COLs
  /// @param destinations   Array of addresses of wallets that hold pixels.
  function sendCoinsForPixels_Batch(
    uint32[] memory pixels,
    address[] memory destinations
  ) public pixel {
    require(pixels.length == destinations.length, "Invalid data");
    for (uint256 i = 0; i < pixels.length; i++) {
      uint256 coins = pixels[i]*pixelConvRate;
      address dst = destinations[i];
      coinContract.transferFrom(address(this), dst, coins);
    }
  }

  /// @notice Distribute COL coins for pixels to multiple users.
  ///   COLs are spent from `pixelAccount` wallet. The amount of COLs sent to each wallet is equal to `getPixelConversionRate() * pixels`
  /// @dev The difference between `sendCoinsForPixels_Array` and `sendCoinsForPixels_Batch`
  ///   is that all destination wallets hold the same amount of pixels.
  ///   This optimization saves about 10% of gas compared to `sendCoinsForPixels_Batch`
  ///   with the same amount of recipients.
  /// @param pixels   Amount of pixels to exchange. All of `recipients` hold the same amount of pixels.
  /// @param recipients Addresses of wallets, holding `pixels` amount of pixels.
  function sendCoinsForPixels_Array(
    uint32 pixels, address[] memory recipients
  ) public pixel {
    uint256 coins = pixels*pixelConvRate;
    uint256 total = coins * recipients.length;

    if (total == 0) return;
    require(total <= coinContract.balanceOf(address(this)), "Not enough funds for pixel distribution");

    for (uint256 i; i < recipients.length; i++) {
      address dst = recipients[i];
      coinContract.transferFrom(address(this), dst, coins);

    }
  }

  function relaseFunds(address _to, uint256 _amount) public pixel {
    if (_amount > 0) {
      coinContract.transferFrom(address(this), _to, _amount);
    }
  }

  function destroy() public {
    require(msg.sender == founder, "Only founder can destroy the contract");
    selfdestruct(founder);
  }
}
