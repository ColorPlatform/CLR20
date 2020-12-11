require("../util/util.js")

contract("Test selfdestruct", accounts => {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]

  it("Admin can't kill the contract", async () => {
    let address = ColorCoin.address
    try {
      await ColorCoin.deployed().then(instance => instance.destroy({from: admin}))
      assert.fail("The call should have failed")
    } catch(error) {
      console.log("Exception was thrown: " + error);
    }
    // Check that there is still code at the specified address
    code = await web3.eth.getCode(address)
    assert.notEqual(code, "0x", "Code should be empty")
  })

  it("User can't kill the contract", async () => {
    let address = ColorCoin.address
    try {
      await ColorCoin.deployed().then(instance => instance.destroy({from: user}))
      assert.fail("The call should have failed")
    } catch(error) {
      console.log("Exception was thrown: " + error);
    }
    // Check that there is still code at the specified address
    code = await web3.eth.getCode(address)
    assert.notEqual(code, "0x", "Code should be empty")
  })

  it("Founder can kill the contract", async () => {
    let address = ColorCoin.address
    await ColorCoin.deployed()
      .then(instance => instance.destroy({from: founder}))
      .delay(1000)
    // Check that there is no code at the specified address
    code = await web3.eth.getCode(address)
    assert.equal(code, "0x", "Code should be empty")
  })
})
