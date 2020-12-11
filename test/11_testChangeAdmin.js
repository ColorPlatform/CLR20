require("../util/util.js")

contract('ColorCoin-TestChangeAdmin', accounts => {
  var founder = accounts[0]
  var admin = accounts[1]
  var newAdmin = accounts[2]

  it('Original admin', async () => {
    let instance = await ColorCoin.deployed()
    let adminAddress = await instance.getAdmin.call()
    assert.equal(adminAddress, admin, "Wrong admin")
  })

  it('The original admin has the super-powers', async () => {
    let instance = await ColorCoin.deployed()
    try {
      await instance.disableTransfer({from: admin})
    } catch(error) {
      console.log("Error: " + error)
      assert.fail("Should have passed without exception")
    }
  })

  it('The original admin can\'t change admin', async () => {
    let instance = await ColorCoin.deployed()
    try {
      await instance.changeAdmin(newAdmin, {from: admin})
      assert.fail("Must have failed: admin does't have rights to set a new admin")
    } catch(error) {
      console.log("Error: "+ error)
    }
    let adminAddress = await instance.getAdmin.call()
    assert.equal(adminAddress, admin, "Admin must be the same")
  })

  it('The founder can change admin', async () => {
    let instance = await ColorCoin.deployed()
    try {
      await instance.changeAdmin(newAdmin, {from: founder})
    } catch(error) {
      console.log("Error: "+ error)
      assert.fail("Must have passed: the founder have the right to set a new admin")
    }
    let adminAddress = await instance.getAdmin.call()
    assert.equal(adminAddress, newAdmin, "Must be a new admin")
  })

  it('The new admin has the super-powers', async () => {
    let instance = await ColorCoin.deployed()
    try {
      await instance.disableTransfer({from: newAdmin})
    } catch(error) {
      console.log("Error: ", error)
      assert.fail("Should have passed without exception")
    }
  })

  it('The original admin lost the super-powers', async () => {
    let instance = await ColorCoin.deployed()
    try {
      await instance.disableTransfer({from: admin})
      assert.fail("Must have failed: the original admin is no longer the admin")
    } catch(error) {
      console.log("Error: " + error)
    }
  })
})
