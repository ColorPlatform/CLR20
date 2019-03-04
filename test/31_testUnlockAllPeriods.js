require("../util/util.js")

var timestamp = 0
var end = 0

contract('ColorCoin-TestUnlockAllPeriods', accounts => {
  var initialLockedAmount = _100
  var initialBalance = initialLockedAmount
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[3]

  console.log("TestUnlockAllPeriods started: " + new Date().getTime())

  it("Distribute coins to user", async () => {
    console.log("  Contract address: " + ColorCoin.address)
    timestamp = Math.floor(new Date().getTime()/1000)
    end = timestamp + 7
    console.log("Timestamp is " + timestamp)
    console.log("Last period: " + end);
    await ColorCoin.deployed()
      .then(contract => {
            contract.distribute(user, _100,
              [new BN(timestamp+1), new BN(timestamp+2), new BN(timestamp+3), new BN(timestamp+4), new BN(timestamp+5), new BN(timestamp+6)],
              [_10, _10, _10, _10, _10, _10],
              {from: founder})
            console.log("  Contract address: " + contract.address)
            return contract
      })
    let balance = await ColorCoin.deployed()
      .then(contract => contract.balanceOf.call(user))
    console.log("Distribute done, user balance is " + balance)
  })


  it("Check ensureLockUp: all lockup periods", async () => {
    var msec = end*1000+100 - new Date().getTime()
    if (msec < 0) {
      assert.fail("Too late")
    }
    console.log("Wait for " + msec + " milliseconds")
    let instance = await ColorCoin.deployed().delay(msec);

    let tx = await instance.doUnlock({from:user});
    console.log("Transaction sent at: " + new Date().getTime());

    let result = await ColorCoin.deployed()
      .then(instance => instance. getLockedAmount.call({from: user}))
    console.log("Locked amount checked at: " + new Date().getTime());
    console.log("Locked amount after timer: " + result.toString())
    var amountLeft = new BN(0)
    assert.ok(amountLeft.eq(result),
      "lockedAmount expected " + amountLeft + ", got " + result)

    var expectedBalance = _100;
    let balance = await ColorCoin.deployed().then(instance => instance.accountBalance.call(user))
    assert.ok(expectedBalance.eq(balance),
      "Balance expected to be " + expectedBalance + ", got " + balance)
    let totalBalance = await ColorCoin.deployed().then(instance => instance.balanceOf.call(user))
    assert.ok(_100.eq(totalBalance),
      "Total balance expected to be " + _100 + ", got " + totalBalance)
  })

  console.log("TestUnlockAllPeriods finished: " + new Date().getTime())
})
