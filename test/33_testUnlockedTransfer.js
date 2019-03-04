require("../util/util.js")

var timestamp
var t1
var end

contract('ColorCoin-TestUnlockTransfer', accounts => {
  var initialLockedAmount = _100
  var initialBalance = initialLockedAmount
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]

  // Distribute coins to the user
  it("Distribute coins to user1", async () => {
    timestamp = Math.floor((new Date().getTime())/1000)
    t1 = timestamp + 3
    end = timestamp + 31*24*3600

    await ColorCoin.deployed()
      .then(contract => {
            contract.distribute(user, _100,
              [new BN(t1), new BN(end)],
              [_30, _0],
              {from: founder})
            return contract
      }).delay(4000)
    var balance = await ColorCoin.deployed().then(contract => contract.balanceOf.call(user))
    console.log("Distribute done, user balance is " + balance)
    assert.equalBN(balance, _100, "Wrong balance")
  })

  it("Admin enables transfers", async() => {
      await ColorCoin.deployed()
        .then(contract => contract.enableTransfer({from: admin}))
      var enabled = await ColorCoin.deployed().then(contract => contract.isTransferEnabled.call())
      console.log("Transfer enabled: " + enabled)
      assert.isTrue(enabled, "Wrong value of flag")
    })

  it("User can transfer unlocked coins", async () => {
      await ColorCoin.deployed()
        .then(contract => contract.transfer(user2, _10, {from: user1}))

      let balance1 = await ColorCoin.deployed()
        .then(contract => contract.balanceOf.call(user1))
      let balance2 = await ColorCoin.deployed()
        .then(contract => contract.balanceOf.call(user2))
      assert.equalBN(balance1, _90, "Wrong balance of user 1")
      assert.equalBN(balance2, _10, "Wrong balance of user 2")

      let unlockedCoins = await ColorCoin.deployed()
        .then(contract => contract.accountBalance.call(user1))
      assert.equalBN(unlockedCoins, _20, "Wrong amount of unlocked coins")
    })

  it("User can't spend locked coins", async () => {
      // user1 balance is 120 (see the previous test)
      try {
        await ColorCoin.deployed()
          .then(contract => contract.transfer(user2, _30, {from: user1}))
        assert.fail("The transfer should have failed")
      } catch (error) {
        console.log("Transfer fired an exception: " + error);
      }
      let balance1 = await ColorCoin.deployed()
        .then(contract => contract.balanceOf.call(user1))
      let balance2 = await ColorCoin.deployed()
        .then(contract => contract.balanceOf.call(user2))
      assert.equalBN(balance1, _90, "Wrong balance of user 1")
      assert.equalBN(balance2, _10, "Wrong balance of user 2")
    })

})
