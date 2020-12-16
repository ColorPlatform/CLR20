var ColorCoin = artifacts.require("./TestColorCoin.sol");
var TransferCLR = artifacts.require("./TransferCLR.sol");
var Pixel = artifacts.require("./Pixel.sol");

module.exports = function(deployer, network, accounts) {
  console.log("Deploying Color Coin:")
  console.log("  founder address:", accounts[0])
  console.log("  admin address:", accounts[1])
  console.log("  Pixel account:", accounts[9]);
  console.log("  TransferCLR owner:", accounts[8]);

  var BN = web3.utils.BN
  // five hundred million
  var initialSupply = new BN("500000000000000000000000000")
  var founder = accounts[0]
  var admin = accounts[1]
  // two coins per second
  // var mintingSpeed = new BN("2000000000000000000")
  var mintingSpeed = 0;
  var pixelAccount = accounts[9]
  // twenty million
  var pixelSupply = new BN("20000000000000000000000000")

  let transferOwner = accounts[8];
  let colorCoin = null;

  deployer.deploy(ColorCoin, initialSupply, founder, admin, mintingSpeed
  ).then(
    function (instance) {
      console.log("CLR: Deployed at:", instance.address)
      return instance
    }
  ).then(
    function(clrInstance) {
      colorCoin = clrInstance
      return deployer.deploy(TransferCLR, clrInstance.address, {from: transferOwner})
    }
  ).then(
    function(instance) {
      console.log("TransferCLR: Deployed at:", instance.address)
      return deployer.deploy(Pixel, colorCoin.address, pixelAccount, {from: founder})
    }
  ).then(
    function(instance) {
      console.log("Pixel: Deployed at:", instance.address)
    }
  )

};
