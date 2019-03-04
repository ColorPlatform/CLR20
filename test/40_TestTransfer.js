require("../util/util.js")

contract("ColorCoin-TestTransfer", function (accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]

  contract("Test basic transfer", function () {
    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Founder provides user with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")

      let circulating = await instance.circulatingSupply.call();
      assert.equalBN(circulating, _100, "Wrong circulating supply")
    })

    it("User transfers coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user2, _30, {from: user1})
      let balance1 = await instance.balanceOf.call(user1)
      let balance2 = await instance.balanceOf.call(user2)
      assert.equalBN(balance1, _70, "Wrong user1 balance")
      assert.equalBN(balance2, _30, "Wrong user2 balance")

      let circulating = await instance.circulatingSupply.call();
      assert.equalBN(circulating, _100, "Wrong circulating supply")
    })
  })

  contract("Test overdraft", () => {
    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Founder provides user with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user, _30, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _30, "Wrong user balance")

      let circulating = await instance.circulatingSupply.call();
      assert.equalBN(circulating, _30, "Wrong circulating supply")
    })

    it("User transfers coins", async () => {
      let instance = await ColorCoin.deployed()
      try {
        await instance.transfer(user2, _100, {from: user1})
        assert.fail("Should have thrown an exception")
      } catch(error) {
        console.log("Error caught: " + error);
      }
      let balance1 = await instance.balanceOf.call(user1)
      let balance2 = await instance.balanceOf.call(user2)
      assert.equalBN(balance1, _30, "Wrong user1 balance")
      assert.equalBN(balance2, _0, "Wrong user2 balance")

      let circulating = await instance.circulatingSupply.call();
      assert.equalBN(circulating, _30, "Wrong circulating supply")
    })
  })
})
