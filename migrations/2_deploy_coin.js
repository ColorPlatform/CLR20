var ColorCoin = artifacts.require("./TestColorCoin.sol");

module.exports = function(deployer, network, accounts) {
  console.log("Deploying Color Coin:")
  console.log("  founder address:", accounts[0])
  console.log("  admin address:", accounts[1])
  console.log("  Pixel account:", accounts[9]);

  var BN = web3.utils.BN
  // five hundred million
  var initialSupply = new BN("500000000000000000000000000")
  var founder = accounts[0]
  var admin = accounts[1]
  // two coins per second
  var mintSpeed = new BN("2000000000000000000")
  var pixelAccount = accounts[9]
  // twenty million
  var pixelSupply = new BN("20000000000000000000000000")


  deployer.deploy(ColorCoin, initialSupply, founder, admin, mintSpeed,
      pixelSupply, pixelAccount).then(
    function (instance) {
      console.log("Deployed at:", instance.address)
    }
  )
};
