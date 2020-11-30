require("../util/util.js")

contract("ColorCoin-TestTransfer", function (accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]

  contract("Test Mint", function () {
    var initialFounder = null

    it("Founder transfer", async () => {
      let instance = await ColorCoin.deployed()
      initialFounder = await instance.balanceOf.call(founder)
      console.log("Test Mint: initial balance: ", initialFounder.toString())
      await ColorCoin.deployed().delay(2000);
      await instance.transfer(user, _100, {from: founder})
      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _100, "Wrong user balance")

      let newFounder = await instance.balanceOf.call(founder);
      let updateFounder = initialFounder.sub(_100)
      console.log("Test Mint: Minted: ", newFounder.sub(updateFounder).div(coin).toString())
      assert.gtBN(newFounder, updateFounder, "Nothing minted")
    })
/*
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
*/
  })

})
