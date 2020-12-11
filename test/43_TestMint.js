require("../util/util.js")

contract("ColorCoin-TestTransfer", function (accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]

  contract("Test Mint", function () {

    it("Founder transfer", async () => {
      let instance = await ColorCoin.deployed()
      let actualMintingSpeed = await instance.getMintingSpeed.call()
      assert.equalBN(actualMintingSpeed, _0, "Non-zero minting speed")

      let initialFounder = await instance.balanceOf.call(founder)
      console.log("Test Mint: initial balance: ", initialFounder.toString())
      
      await instance.setMintingSpeed(mintingSpeed, {from: founder})
      actualMintingSpeed = await instance.getMintingSpeed.call()
      assert.equalBN(actualMintingSpeed, mintingSpeed, "Minting speed is not updated")

      // Test that there are coins to transfer
      await ColorCoin.deployed().delay(2000);
      // First, we need the testnet to produce a new block, 
      // therefore we issue a transaction with state modifying operation
      await instance.enableTransfer({from: admin})
      
      let coins = await instance.expectedMint();
      console.log("Test Mint: coins to mint: ", coins.toString())
      assert.gtBN(coins, _0, "Zero coins to mint")

      await instance.transfer(user, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")

      let newFounder = await instance.balanceOf.call(founder);
      let updateFounder = initialFounder.sub(_100)
      console.log("Test Mint: Minted: ", newFounder.sub(updateFounder).div(coin).toString())
      assert.gtBN(newFounder, updateFounder, "Nothing minted")

      // Nothing left to mint
      coins = await instance.expectedMint();
      console.log("Test Mint: coins to mint after transfer: ", coins.toString())
      assert.equalBN(coins, _0, "Coins left for minting")

    })

    it("User transfers coins", async () => {
      let instance = await ColorCoin.deployed()
      initialFounder = await instance.balanceOf.call(founder)
      await ColorCoin.deployed().delay(2000);

      // Test that there are coins to mint
      // First, we need the testnet to produce a new block, 
      // therefore we issue a transaction with state modifying operation
      await instance.enableTransfer({from: admin})
      coins = await instance.expectedMint();
      console.log("Test Mint: coins to mint: ", coins.toString())
      assert.gtBN(coins, _0, "Zero coins to mint")

      await instance.transfer(user2, _30, {from: user1})
      let newFounder = await instance.balanceOf.call(founder);
      assert.gtBN(newFounder, initialFounder, "Nothing minted");

      // Nothing left to mint
      coins = await instance.expectedMint();
      console.log("Test Mint: coins to mint after transfer: ", coins.toString())
      assert.equalBN(coins, _0, "Coins left for minting")
    })

    it("User invokes mint", async () => {
      let instance = await ColorCoin.deployed()
      initialFounder = await instance.balanceOf.call(founder)
      await ColorCoin.deployed().delay(2000);

      // Test that there are coins to mint
      // First, we need the testnet to produce a new block, 
      // therefore we issue a transaction with state modifying operation
      await instance.enableTransfer({from: admin})
      coins = await instance.expectedMint();
      console.log("Test Mint: coins to mint: ", coins.toString())
      assert.gtBN(coins, _0, "Zero coins to mint")

      await instance.transfer(user2, _30, {from: user1})
      let newFounder = await instance.balanceOf.call(founder);
      assert.gtBN(newFounder, initialFounder, "Nothing minted");

      // Nothing left to mint
      coins = await instance.expectedMint();
      console.log("Test Mint: coins to mint after transfer: ", coins.toString())
      assert.equalBN(coins, _0, "Coins left for minting")
    })

  })

  contract("Test Increase/Decrease Supply", function () {

    it("Increase supply", async () => {
      let instance = await ColorCoin.deployed()

      let initialSupply = await instance.totalSupply.call()
      await instance.increaseSupply(_10000)
      let newSupply = await instance.totalSupply.call()
      let increase = newSupply.sub(initialSupply)

      assert.equalBN(increase, _10000, "Unexpected supply increase")
    })

    it("Decrease supply", async () => {
      let instance = await ColorCoin.deployed()

      let initialSupply = await instance.totalSupply.call()
      await instance.decreaseSupply(_1000)
      let newSupply = await instance.totalSupply.call()
      let decrease = initialSupply.sub(newSupply)

      assert.equalBN(decrease, _1000, "Unexpected supply decrease")
    })
  })

})
