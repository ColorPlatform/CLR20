require("../util/util.js")

contract("ColorCoin-TestTransferFrom", function (accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]
  var user3 = accounts[4]

  var owner = user1; var spender = user2; var dst = user3;

  contract("Test approve when the owner is suspended", function () {
    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Founder provides the owner with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user1, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")
    })

    it("Admin suspends the owner", async () => {
      let instance = await ColorCoin.deployed()
      await instance.suspend(owner, {from: admin})
      let result = await instance.isSuspended.call(owner)
      assert.isTrue(result, "Admin failed to suspend owner")
    })

    // Approvals are disabled
    it("The owner fails to allow the spender to transfer coins", async () => {
      let instance = await ColorCoin.deployed()
      let hadException = 0;
      try {
        await instance.approve(spender, _50, {from: owner})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true;
      }
      assert.isTrue(hadException, "Should have thrown an exception")
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _0, "Wrong allowance")
    })
  })

  contract("Test transfer when the owner is suspended", function () {
    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Founder provides the owner with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user1, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")
    })

    it("The owner allowes the spender to transfer coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.approve(spender, _50, {from: owner})
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _50, "Wrong allowance")
    })

    it("Admin suspends the owner", async () => {
      let instance = await ColorCoin.deployed()
      await instance.suspend(owner, {from: admin})
      let result = await instance.isSuspended.call(owner)
      assert.isTrue(result, "Admin failed to suspend owner")
    })

    it("The spender fails to transfer coins from owner", async () => {
      let hadException = false;
      let instance = await ColorCoin.deployed()
      try {
        await instance.transferFrom(owner, dst, _30, {from: spender})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true;
      }
      assert.isTrue(hadException, "Should have thrown an exception")

      // Check that balances are the same
      let balance1 = await instance.balanceOf.call(owner)
      let balance2 = await instance.balanceOf.call(spender)
      let balance3 = await instance.balanceOf.call(dst)
      assert.equalBN(balance1, _100, "Wrong owner balance")
      assert.equalBN(balance2, _0, "Wrong spenders balance")
      assert.equalBN(balance3, _0, "Wrong dst balance")
      // check that the allowance is the same
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _50, "Wrong allowance")
    })
  })

  contract("Test transfer when the spender is suspended", function () {
    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Founder provides the owner with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user1, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")
    })

    it("The owner allows the spender to transfer coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.approve(spender, _50, {from: owner})
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _50, "Wrong allowance")
    })

    it("Admin suspends the spender", async () => {
      let instance = await ColorCoin.deployed()
      await instance.suspend(spender, {from: admin})
      let result = await instance.isSuspended.call(spender)
      assert.isTrue(result, "Admin failed to suspend the spender")
    })

    it("The suspended spender fails to transfer coins", async () => {
      let instance = await ColorCoin.deployed()
      let suspended = await instance.isSuspended.call(spender)
      assert.isTrue(suspended, "Admin failed to suspend the spender")

      let hadException = false;
      try {
        await instance.transferFrom(owner, dst, _30, {from: spender})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true;
      }
      assert.isTrue(hadException, "Should have thrown an exception")

      // Check that balances are the same
      let balance1 = await instance.balanceOf.call(owner)
      let balance2 = await instance.balanceOf.call(spender)
      let balance3 = await instance.balanceOf.call(dst)
      assert.equalBN(balance1, _100, "Wrong owner balance")
      assert.equalBN(balance2, _0, "Wrong spenders balance")
      assert.equalBN(balance3, _0, "Wrong dst balance")
      // check that the allowance is the same
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _50, "Wrong allowance")
    })
  })

  contract("Test transfer when the receiver is suspended", function () {
    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Founder provides the owner with coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.transfer(user1, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")
    })

    it("The owner allowes the spender to transfer coins", async () => {
      let instance = await ColorCoin.deployed()
      await instance.approve(spender, _50, {from: owner})
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _50, "Wrong allowance")
    })

    it("Admin suspends the receiver", async () => {
      let instance = await ColorCoin.deployed()
      await instance.suspend(dst, {from: admin})
      let result = await instance.isSuspended.call(dst)
      assert.isTrue(result, "Admin failed to suspend the receiver")
    })

    it("The spender fails to transfer coins to suspended receiver", async () => {
      let hadException = false;
      let instance = await ColorCoin.deployed()
      try {
        await instance.transferFrom(owner, dst, _30, {from: spender})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true;
      }
      assert.isTrue(hadException, "Should have thrown an exception")

      // Check that balances are the same
      let balance1 = await instance.balanceOf.call(owner)
      let balance2 = await instance.balanceOf.call(spender)
      let balance3 = await instance.balanceOf.call(dst)
      assert.equalBN(balance1, _100, "Wrong owner balance")
      assert.equalBN(balance2, _0, "Wrong spenders balance")
      assert.equalBN(balance3, _0, "Wrong dst balance")
      // check that the allowance is the same
      let allowance = await instance.allowance.call(owner, spender)
      assert.equalBN(allowance, _50, "Wrong allowance")
    })
  })
})
