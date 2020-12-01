require("../util/util.js")

contract("ColorCoin-TestTransfer", function (accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = user
  var user2 = accounts[3]
  let transferOwner = accounts[8]

  contract("Test external transfer", function () {
    it("Admin enables transfers", async () => {
      let instance = await ColorCoin.deployed()
      await instance.enableTransfer({from: admin})
      let result = await instance.isTransferEnabled.call()
      assert.isTrue(result, "Admin failed to enable transfers")
    })

    it("Founder allows external transfers", async () => {
      let instance = await ColorCoin.deployed()
      let tranferContract = await TransferCLR.deployed()

      await instance.approve(tranferContract.address, _100, {from: founder})
    })

    it("Single external transfer", async () => {
      let instance = await ColorCoin.deployed()
      let tranferContract = await TransferCLR.deployed()
      await tranferContract.transfer(founder, user, _10, {from: transferOwner})

      let result = await instance.balanceOf.call(user)
      assert.equalBN(result, _10, "Wrong user balance")
    })

    it("Batch external transfer", async () => {
      let instance = await ColorCoin.deployed()
      let tranferContract = await TransferCLR.deployed()

      // allowence: 90 left
      var destinations = [];
      var amounts = [];
      
      // prepare addresses
      destinations.push(user2); amounts.push(_1);
      destinations.push(user2); amounts.push(_2);
      destinations.push(user2); amounts.push(_3);
      destinations.push(user2); amounts.push(_4);
      destinations.push(user2); amounts.push(_5);
      destinations.push(user2); amounts.push(_6);
      destinations.push(user2); amounts.push(_7);
      destinations.push(user2); amounts.push(_8);
      destinations.push(user2); amounts.push(_9);
      destinations.push(user2); amounts.push(_10);
      destinations.push(user2); amounts.push(_20);
      var _total = _1.mul(new BN(75));

      await tranferContract.transfer_Batch(
        founder,
        destinations, amounts,
        {from: transferOwner}
      );
      userBalance = await instance.balanceOf.call(user2)
      assert.equalBN(userBalance, _total, "Wrong final balance");
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
/*
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
*/
})
