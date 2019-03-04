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
  var user3 = accounts[4]

  contract("Amounts exceed the total value", function () {
    it("Big single chunk", async () => {
      timestamp = Math.floor((new Date().getTime())/1000)
      t1 = timestamp + 3
      end = timestamp + 31*24*3600

      let instance = await ColorCoin.deployed();
      await instance.distribute(user, _30,
                [new BN(t1), new BN(end)],
                [_100, _0],
                {from: founder})
        .delay(4000);

      await instance.doUnlock_Admin(user, {from:admin})

      var balance = await instance.balanceOf.call(user)
      var locked = await instance.getLockedAmount.call({from:user})
      console.log("Distribute done, user balance is " + balance)
      console.log("Unlocked, locked is " + locked)
      assert.equalBN(balance, _30, "Wrong balance")
      assert.equalBN(locked, _0, "Wrong balance")
    })

    it("Several chunks, big total value", async () => {
      timestamp = Math.floor((new Date().getTime())/1000)
      var t1 = timestamp + 1
      var t2 = timestamp + 2
      end = timestamp + 31*24*3600

      let instance = await ColorCoin.deployed();
      await instance.distribute(user2, _40,
                [new BN(t1), new BN(t2), new BN(end)],
                [_10, _40, _0],
                {from: founder})
        .delay(4000);

        await instance.doUnlock_Admin(user2, {from:admin})

        var balance = await instance.balanceOf.call(user2)
        var locked = await instance.getLockedAmount.call({from:user2})
        console.log("Distribute done, user balance is " + balance)
        console.log("Unlocked, locked is " + locked)
        assert.equalBN(balance, _40, "Wrong balance")
        assert.equalBN(locked, _0, "Wrong balance")
    })

    it("Chunks with messed time stamps", async () => {
      var timestamp = Math.floor((new Date().getTime())/1000)
      var t1 = timestamp + 3
      var t2 = timestamp + 2
      var end = timestamp + 1

      let instance = await ColorCoin.deployed();
      await instance.distribute(user3, _50,
                [new BN(t1), new BN(t2), new BN(end)],
                [_10, _20, _30],
                {from: founder})
        .delay(4000);

        await instance.doUnlock_Admin(user3, {from:admin})

        var balance = await instance.balanceOf.call(user3)
        var locked = await instance.getLockedAmount.call({from:user3})
        console.log("Distribute done, user balance is " + balance)
        console.log("Unlocked, locked is " + locked)
        assert.equalBN(balance, _50, "Wrong balance")
        assert.equalBN(locked, _0, "Wrong balance")
    })
  })
})
