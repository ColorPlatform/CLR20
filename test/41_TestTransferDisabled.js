require("../util/util.js")

contract("ColorCoin-TestTransferDisabled", function (accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]

  it("Check transfer is disabled", async () => {
    let instance = await ColorCoin.deployed()
    let result = await instance.isTransferEnabled.call()
    assert.isFalse(result, "Wrong flag value")
  })

  it("Founder can transfer when transfers are disabled", async () => {
    let instance = await ColorCoin.deployed()
    await instance.transfer(user, _100, {from: founder})
    let result = await instance.balanceOf.call(user)
    assert.equalBN(result, _100, "Wrong user balance")
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
})

contract("Test re-disabling transfer", function (accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]

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

  it("User transfers coins", async () => {
    let instance = await ColorCoin.deployed()
    await instance.transfer(user2, _30, {from: user1})
    let balance1 = await instance.balanceOf.call(user1)
    let balance2 = await instance.balanceOf.call(user2)
    assert.equalBN(balance1, _70, "Wrong user1 balance")
    assert.equalBN(balance2, _30, "Wrong user2 balance")
  })

  it("Admin disables transfers", async () => {
    let instance = await ColorCoin.deployed()
    await instance.disableTransfer({from: admin})
    let result = await instance.isTransferEnabled.call()
    assert.isFalse(result, "Admin failed to enable transfers")
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
    assert.equalBN(balance1, _70, "Wrong user1 balance")
    assert.equalBN(balance2, _30, "Wrong user2 balance")
  })

  it ("Users can't disable transfers", async () => {
    let hadException = false
    let instance = await ColorCoin.deployed()
    try {
      await instance.disableTransfer({from: user1})
    } catch(error) {
      console.log("Error caught: " + error);
      hadException = true
    }
    assert.isTrue(hadException, "Should have thrown")
  })
  it ("Founder can't disable transfers", async () => {
    let hadException = false
    let instance = await ColorCoin.deployed()
    try {
      await instance.disableTransfer({from: founder})
    } catch(error) {
      console.log("Error caught: " + error);
      hadException = true
    }
    assert.isTrue(hadException, "Should have thrown")
  })

  it ("Users can't enable transfers", async () => {
    let hadException = false
    let instance = await ColorCoin.deployed()
    try {
      await instance.enableTransfer({from: user1})
    } catch(error) {
      console.log("Error caught: " + error);
      hadException = true
    }
    assert.isTrue(hadException, "Should have thrown")
  })
  it ("Founder can't enable transfers", async () => {
    let hadException = false
    let instance = await ColorCoin.deployed()
    try {
      await instance.enableTransfer({from: founder})
    } catch(error) {
      console.log("Error caught: " + error);
      hadException = true
    }
    assert.isTrue(hadException, "Should have thrown")
  })
})
