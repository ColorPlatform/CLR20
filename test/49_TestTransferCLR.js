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

      var founderBalance = await instance.balanceOf.call(founder)
      await tranferContract.transfer_Batch(
        founder,
        destinations, amounts,
        {from: transferOwner}
      );
      userBalance = await instance.balanceOf.call(user2)
      assert.equalBN(userBalance, _total, "Wrong final balance");

      var newFounderBalance = await instance.balanceOf.call(founder)
      assert.equalBN(founderBalance.sub(newFounderBalance), _total, 
        "Wrong balance of the founder's account"
      )
    })
  })


  contract("Test external transfer fails", function () {
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

    it("Batch external transfer with overdraft", async () => {
      let instance = await ColorCoin.deployed()
      let tranferContract = await TransferCLR.deployed()

      let initialBalance = await instance.balanceOf.call(user2)


      // allowence: 100 left
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
      destinations.push(user2); amounts.push(_30);
      var _total = _1.mul(new BN(105));
      try {
        await tranferContract.transfer_Batch(
          founder,
          destinations, amounts,
          {from: transferOwner}
        );
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true
      }
      assert.isTrue(hadException, "Should have thrown")
      let newBalance = await instance.balanceOf.call(user2)
      assert.equalBN(newBalance, initialBalance, "Transfers must have been reverted");
    })

    it("Batch external transfer from wrong account", async () => {
      let instance = await ColorCoin.deployed()
      let tranferContract = await TransferCLR.deployed()

      let initialBalance = await instance.balanceOf.call(user2)


      // allowance: 100 left
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
      
      try {
        await tranferContract.transfer_Batch(
          founder,
          destinations, amounts,
          {from: founder}
        );
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true
      }
      assert.isTrue(hadException, "Should have thrown")
      let newBalance = await instance.balanceOf.call(user2)
      assert.equalBN(newBalance, initialBalance, "Transfers must have been reverted");
    })
  })

})
