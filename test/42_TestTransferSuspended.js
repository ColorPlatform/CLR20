require("../util/util.js")

contract("ColorCoin-TestTransferSuspended", function (accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]

  contract("Test trunsfer from suspended user", function () {
    it("Check user is not suspended initially", async () => {
      let instance = await ColorCoin.deployed()
      let result = await instance.isSuspended.call(user)
      assert.isFalse(result, "User should not be suspended")
    })

    it("Founder provides user with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")
    })

    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Admin can suspend a user", async () => {
      let instance = await ColorCoin.deployed()
      await instance.suspend(user, {from: admin})
      let result = await instance.isSuspended.call(user)
      assert.isTrue(result, "Admin failed to suspend the user")
    })

    it("User failes to transfer coins", async () => {
      let hadException = false
      let instance = await ColorCoin.deployed()
      try {
        await instance.transfer(user2, _30, {from: user1})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true
      }
      assert.isTrue(hadException, "Should have thrown")
      let balance1 = await instance.balanceOf.call(user1)
      let balance2 = await instance.balanceOf.call(user2)
      assert.equalBN(balance1, _100, "Wrong user1 balance")
      assert.equalBN(balance2, _0, "Wrong user2 balance")
    })
    it("Admin can unsuspend a user", async () => {
      let instance = await ColorCoin.deployed()
      await instance.unsuspend(user, {from: admin})
      let result = await instance.isSuspended.call(user)
      assert.isFalse(result, "Admin failed to unsuspend the user")
    })

    it("User transfers coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user2, _30, {from: user1})
      let balance1 = await instance.balanceOf.call(user1)
      let balance2 = await instance.balanceOf.call(user2)
      assert.equalBN(balance1, _70, "Wrong user1 balance")
      assert.equalBN(balance2, _30, "Wrong user2 balance")
    })
  })

  contract("Test transfer to suspended user", function (accounts) {
    it("Check user2 is not suspended initially", async () => {
      let instance = await ColorCoin.deployed()
      let result = await instance.isSuspended.call(user2)
      assert.isFalse(result, "User should not be suspended")
    })

    it("Founder provides user1 with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user1, _100, {from: founder})
      let result = await instance.balanceOf.call(user1)
      assert.equalBN(result, _100, "Wrong user balance")
    })

    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Admin suspends user2", async () => {
      let instance = await ColorCoin.deployed()
      await instance.suspend(user2, {from: admin})
      let result = await instance.isSuspended.call(user2)
      assert.isTrue(result, "Admin failed to suspend user2")
    })

    it("Transfer to suspended account fails", async () => {
      let hadException = false
      let instance = await ColorCoin.deployed()
      try {
        await instance.transfer(user2, _30, {from: user1})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true
      }
      assert.isTrue(hadException, "Should have thrown")
      let balance1 = await instance.balanceOf.call(user1)
      let balance2 = await instance.balanceOf.call(user2)
      assert.equalBN(balance1, _100, "Wrong user1 balance")
      assert.equalBN(balance2, _0, "Wrong user2 balance")
    })

    it("Admin unsuspends user2", async () => {
      let instance = await ColorCoin.deployed()
      await instance.unsuspend(user2, {from: admin})
      let result = await instance.isSuspended.call(user2)
      assert.isFalse(result, "Admin failed to unsuspend user2")
    })

    it("User1 transfers coins to user2", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user2, _30, {from: user1})
      let balance1 = await instance.balanceOf.call(user1)
      let balance2 = await instance.balanceOf.call(user2)
      assert.equalBN(balance1, _70, "Wrong user1 balance")
      assert.equalBN(balance2, _30, "Wrong user2 balance")
    })
  })
  contract("Test suspend/unsuspend rights", function () {
    it ("Users can't suspend another user", async () => {
      let hadException = false
      let instance = await ColorCoin.deployed()
      try {
        await instance.suspend(user2, {from: user1})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true
      }
      assert.isTrue(hadException, "Should have thrown")
    })

    it ("Founder can't suspend user", async () => {
      let hadException = false
      let instance = await ColorCoin.deployed()
      try {
        await instance.suspend(user2, {from: founder})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true
      }
      assert.isTrue(hadException, "Should have thrown")
    })

    it ("Users can't unsuspend another user", async () => {
      let hadException = false
      let instance = await ColorCoin.deployed()
      try {
        await instance.unsuspend(user2, {from: user1})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true
      }
      assert.isTrue(hadException, "Should have thrown")
    })

    it ("Founder can't unsuspend user", async () => {
      let hadException = false
      let instance = await ColorCoin.deployed()
      try {
        await instance.unsuspend(user2, {from: founder})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true
      }
      assert.isTrue(hadException, "Should have thrown")
    })
  })
})
