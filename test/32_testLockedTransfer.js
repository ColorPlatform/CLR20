require("../util/util.js")

var timestamp = 0
var end = 0

var _130 = _100.add(_30)
var _120 = _100.add(_20)

contract('ColorCoin-TestLockedTransfer', accounts => {
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
    end = timestamp + 31*24*3600

    await ColorCoin.deployed()
      .then(contract => {
            contract.distribute(user, _100,
              [new BN(end)],
              [_30],
              {from: founder})
            return contract
      }).delay(500)
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

  it("User's coins are locked", async () => {
      try {
        await ColorCoin.deployed()
          .then(contract => contract.transfer(user2, _10, {from: user1}))
        assert.fail("The transfer shoulf have failed")
      } catch (error) {
        console.log("Transfer fired an exception: " + error);
      }
      let balance1 = await ColorCoin.deployed()
        .then(contract => contract.balanceOf.call(user1))
      let balance2 = await ColorCoin.deployed()
        .then(contract => contract.balanceOf.call(user2))
      assert.equalBN(balance1, _100, "Wrong balance of user 1")
      assert.equalBN(balance2, _0, "Wrong balance of user 2")
    })

  it("Founder updates balance of the investor", async () => {
      await ColorCoin.deployed()
        .then(contract => contract.transfer(user1, _30, {from: founder}))
      let balance1Before = await ColorCoin.deployed()
        .then(contract => contract.balanceOf.call(user1));
      assert.equalBN(balance1Before, _130, "Wrong balance of user 1")

      await ColorCoin.deployed()
        .then(contract => contract.transfer(user2, _10, {from: user1}))

      let balance1 = await ColorCoin.deployed()
        .then(contract => contract.balanceOf.call(user1))
      let balance2 = await ColorCoin.deployed()
        .then(contract => contract.balanceOf.call(user2))
      assert.equalBN(balance1, _120, "Wrong balance of user 1")
      assert.equalBN(balance2, _10, "Wrong balance of user 2")
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
        assert.equalBN(balance1, _120, "Wrong balance of user 1")
        assert.equalBN(balance2, _10, "Wrong balance of user 2")
      })

})
