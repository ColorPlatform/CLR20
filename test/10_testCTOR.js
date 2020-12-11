require("../util/util.js")

contract('ColorCoin-TestConstructor', accounts => {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = accounts[2]
  var user2 = accounts[3]
  var pixelAccount = accounts[9]
  var founderBalance = initialSupply.sub(pixelSupply)

  var blockNumber = web3.eth.blockNumber;
  // var blockHash = web3.eth.getBlock(blockNumber).hash;
  var timestamp = web3.eth.getBlock(blockNumber).timestamp;

  console.log("TestConstructor started: " + new Date().getTime())
  console.log("  Contract address: " + ColorCoin.address);

  it('Check total supply', () =>
    ColorCoin.deployed()
      .then(instance => instance.totalSupply.call())
      .then(result => {
        console.log("Check total supply: done, result " + result)
        assert.equalBN(result, initialSupply, "Wrong total supply")
      })
  )

  it('Check minting speed', () =>
    ColorCoin.deployed()
      .then(instance => instance.getMintingSpeed.call())
      .then(result => {
        console.log("Check minting speed: done, result " + result)
        assert.equalBN(result, _0, "Wrong minting speed")
      })
  )

  it('Check that coin is COL', () =>
    ColorCoin.deployed()
      .then(instance => instance.symbol.call())
      .then(result => {
        console.log("Check that coin is COL: done, result is " + result);
        assert.equal(result.valueOf(), "COL", "Coin symbol should be COL")
      })
  )

  it('Check admin', () =>
	   ColorCoin.deployed()
      .then(instance => instance.getAdmin.call({from: founder}))
      .then(result => {
        console.log("Check admin: done, result " + result.valueOf());
        assert.equal(result.valueOf(), admin, "Wrong admin")
      })
  )

  it('Check founder', () =>
    ColorCoin.deployed()
      .then(instance => instance.getFounder.call({from: founder}))
      .then(result => {
        console.log("Check founder: done, result " + result.valueOf());
        assert.equal(result.valueOf(), founder, "Wrong founder")
      })
  )

  it('Check that founder is not an investor', () =>
    ColorCoin.deployed()
      .then(instance => instance.getIsInvestor.call(founder))
      .then(result => {
        console.log("Check that founder is not an investor: done, result " + result);
        assert.isFalse(result)
      })
  )

  it('Check that admin is not an investor', () =>
    ColorCoin.deployed()
      .then(instance => instance.getIsInvestor.call(admin))
      .then(result => {
        console.log("Check that admin is not an investor: done, result " + result);
        assert.isFalse(result)
      })
  )

  it('Check that the founder received all coins except for pixel supply', () =>
    ColorCoin.deployed()
      .then(instance => instance.balanceOf.call(founder))
      .then(result => {
        console.log("Check that the founder received all coins except for pixel supply: done, founder's balance is " + result.valueOf())
        assert.equalBN(result, founderBalance, "All coins must be on the founder's account")
      })
  )

  it('Check that transfer is disabled after construction', () =>
    ColorCoin.deployed()
      .then(instance => instance.isTransferEnabled.call())
      .then(result => {
        console.log("Check that transfer is disabled after construction: done, result " + result)
        assert.isFalse(result)
      })
  )

  console.log("TestConstructor finished: " + new Date().getTime());
})
