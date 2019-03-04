require("../util/util.js")

contract('ColorCoin-TestConstructor', accounts => {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  var user1 = accounts[2]
  var user2 = accounts[3]
  var pixelAccount = accounts[9]
  var founderBalance = initialSupply.sub(pixelSupply)

  var blockNumber = web3.eth.blockNumber;
  // var blockHash = web3.eth.getBlock(blockNumber).hash;
  var timestamp = web3.eth.getBlock(blockNumber).timestamp;

  console.log("TestConstructor started: " + new Date().getTime())
  console.log("  Contract address: " + ColorCoin.address);

  it('Check total supply', () =>
    ColorCoin.deployed()
      .then(instance => instance.totalSupply.call())
      .then(result => {
        console.log("Check total supply: done, result " + result)
        assert.equalBN(result, initialSupply, "Wrong total supply")
      })
  )

  it('Check that coin is COL', () =>
    ColorCoin.deployed()
      .then(instance => instance.symbol.call())
      .then(result => {
        console.log("Check that coin is COL: done, result is " + result);
        assert.equal(result.valueOf(), "COL", "Coin symbol should be COL")
      })
  )

  it('Check admin', () =>
	   ColorCoin.deployed()
      .then(instance => instance.getAdmin.call({from: founder}))
      .then(result => {
        console.log("Check admin: done, result " + result.valueOf());
        assert.equal(result.valueOf(), admin, "Wrong admin")
      })
  )

  it('Check founder', () =>
    ColorCoin.deployed()
      .then(instance => instance.getFounder.call({from: founder}))
      .then(result => {
        console.log("Check founder: done, result " + result.valueOf());
        assert.equal(result.valueOf(), founder, "Wrong founder")
      })
  )

  it('Check that founder is not an investor', () =>
    ColorCoin.deployed()
      .then(instance => instance.getIsInvestor.call(founder))
      .then(result => {
        console.log("Check that founder is not an investor: done, result " + result);
        assert.isFalse(result)
      })
  )

  it('Check that admin is not an investor', () =>
    ColorCoin.deployed()
      .then(instance => instance.getIsInvestor.call(admin))
      .then(result => {
        console.log("Check that admin is not an investor: done, result " + result);
        assert.isFalse(result)
      })
  )

  it('Check that the founder received all coins except for pixel supply', () =>
    ColorCoin.deployed()
      .then(instance => instance.balanceOf.call(founder))
      .then(result => {
        console.log("Check that the founder received all coins except for pixel supply: done, founder's balance is " + result.valueOf())
        assert.equalBN(result, founderBalance, "All coins must be on the founder's account")
      })
  )

  it('Check that transfer is disabled after construction', () =>
    ColorCoin.deployed()
      .then(instance => instance.isTransferEnabled.call())
      .then(result => {
        console.log("Check that transfer is disabled after construction: done, result " + result)
        assert.isFalse(result)
      })
  )

  console.log("TestConstructor finished: " + new Date().getTime());

/*
  it('Deliver to another user', function() {
	  var contract

	  return ColorCoin.deployed().then(function (instance) {
		  contract = instance
		  return contract.distribute(user, _100, {from: founder})
	  }).then(function(result) {
		  return contract.getInitBalance(user)
	  }).then(function(result) {
		  console.log("Initial balance: " + result)
		  assert.ok(result.eq(_100), "Wrong init balance")
	  })
  })

	it('Admin enables transfer', function() {
        var contract

        return ColorCoin.deployed().then(function(instance) {
            contract = instance
            return contract.enableTransfer({from: admin})
        }).then(function() {
            // Check that the flag 'isTransferable' is set to 'true'
            return contract.isTransferable.call()
        }).then(function(isTransferable) {
            assert.ok(
                isTransferable,
                "Flag 'isTransferable' wasn't set"
            )
        })
    })

	/*
    	Test transfer between users.
    	User1 transfers 3000 coins to user2
    	Check balances after transfer
    */
	/*
	var balance1 = {before: undefined, after: undefined}
	var balance2 = {before: undefined, after: undefined}
	it("Transfer coins between users without Percent1 set", function() {
		var contract

		return ColorCoin.deployed().then(function(instance) {
            contract = instance
            return contract.balanceOf.call(user1)
        }).then(function(result) {
			balance1.before = result
			console.log("Balance 1 - before: " + result)
			return contract.balanceOf.call(user2)
		}).then(function(result) {
			balance2.before = result
			console.log("Balance 2 - before: " + result)

			return contract.transfer(user2, _30, {from: user1})
		}).then(function(instance) {
			console.log("After transfer")
			// console.log(util.inspect(instance, {showHidden: false, depth: null}))
            return contract.balanceOf.call(user1)
        }).then(function(result) {
			balance1.after = result
			console.log("Balance 1 - after: " + result)
			return contract.balanceOf.call(user2)
		}).then(function(result) {
			balance2.after = result
			console.log("Balance 2 - after: " + result)

			assert.ok(balance2.after.eq(balance2.before.plus(_30)), "Wrong sum deposited to user2")
			assert.ok(balance1.after.eq(balance1.before.minus(_30)), "Wrong sum withdrawn from user1")
		})
	})

	it('Founder sets percent1 to user 1', function() {
        var contract

        return ColorCoin.deployed().then(function(instance) {
            contract = instance
            return contract.setPercent1(user1, 100, {from: founder})
        }).then(function() {
            // Check that the flag 'isTransferable' is set to 'true'
            return contract.getPercent1.call(user1)
        }).then(function(result) {
			console.log("getPercent1: " + result)
        })
    })

	var balance1 = {before: undefined, after: undefined}
	var balance2 = {before: undefined, after: undefined}
	it("Transfer coins between users from user1", function() {
		var contract

		return ColorCoin.deployed().then(function(instance) {
            contract = instance
            return contract.balanceOf.call(user1)
        }).then(function(result) {
			balance1.before = result
			console.log("Balance 1 - before: " + result)
			return contract.balanceOf.call(user2)
		}).then(function(result) {
			balance2.before = result
			console.log("Balance 2 - before: " + result)

			return contract.transfer(user2, _30, {from: user1})
		}).then(function(instance) {
			console.log("After transfer")
			// console.log(util.inspect(instance, {showHidden: false, depth: null}))
            return contract.balanceOf.call(user1)
        }).then(function(result) {
			balance1.after = result
			console.log("Balance 1 - after: " + result)
			return contract.balanceOf.call(user2)
		}).then(function(result) {
			balance2.after = result
			console.log("Balance 2 - after: " + result)

			assert.ok(balance2.after.eq(balance2.before.plus(_30)), "Wrong sum deposited to user2")
			assert.ok(balance1.after.eq(balance1.before.minus(_30)), "Wrong sum withdrawn from user1")
		})
	})

/*
  it('Founder balance initially is totalSupply', function () {
	assertBalance(accounts[0], initialSupply,
		"All coins should be allocated at the founder's account")
  })

  it('Initially transfer is disabled', function () {
	  return ColorCoin.deployed().then(function (instance) {
		return instance.transfer.call(admin, 0, {from: founder})
	}).then(function(result) {
		assert.fail("Should have thrown exception")
	}).catch(function (err) {
		if ('constructor' in err && err.constructor.name == "AssertionError") {
			throw err
		}
	})
  })

*/
})
