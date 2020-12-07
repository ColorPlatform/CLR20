require("../util/util.js")

contract("ColorCoin-TestAdminTransfer", function (accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]
  var user3 = accounts[4]

  contract("Test basic admin transfer", function () {
    // it("Admin enables transfers", async () => {
    //   let instance = await ColorCoin.deployed()
    //   await instance.enableTransfer({from: admin})
    //   let result = await instance.isTransferEnabled.call()
    //   assert.isTrue(result, "Admin failed to enable transfers")
    // })

    it("Founder provides user1 with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user1, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")

      let circulating = await instance.circulatingSupply.call();
      assert.equalBN(circulating, _100, "Wrong circulating supply")
    })

    it("Admin transfers coins from user1 to user2", async () => {
      let instance = await ColorCoin.deployed()
      msg = "Testing admin transfer"
      await instance.adminTransfer(user1, user2, _30, msg, {from: admin})
      // Check new balances
      let balance1 = await instance.balanceOf.call(user1)
      let balance2 = await instance.balanceOf.call(user2)

      assert.equalBN(balance1, _70, "Wrong owner balance")
      assert.equalBN(balance2, _30, "Wrong spenders balance")

      let circulating = await instance.circulatingSupply.call();
      assert.equalBN(circulating, _100, "Wrong circulating supply")
    })
  })
  contract("Test admin transfer with overdraft", function () {
    // it("Admin enables transfers", async () => {
    //   let instance = await ColorCoin.deployed()
    //   await instance.enableTransfer({from: admin})
    //   let result = await instance.isTransferEnabled.call()
    //   assert.isTrue(result, "Admin failed to enable transfers")
    // })

    it("Founder provides user1 with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user1, _10, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _10, "Wrong user balance")
    })

    it("Admin transfers coins from user1 to user2", async () => {
      let instance = await ColorCoin.deployed()
      msg = "Testing admin transfer"
      await instance.adminTransfer(user1, user2, _30, msg, {from: admin})
      // Check new balances
      let balance1 = await instance.balanceOf.call(user1)
      let balance2 = await instance.balanceOf.call(user2)

      assert.equalBN(balance1, _0, "Wrong user1 balance")
      assert.equalBN(balance2, _10, "Wrong user2 balance")

      var hadException = false;
      try {
        item = await instance.getAdminTransferLogItem.call(0, {from: user3});
      } catch(error) {
        hadException = true;
        console.log("Exception caught: " + error);
      }
      assert.isTrue(hadException, "Should have thrown an exception")
    })
  })
})
