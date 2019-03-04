require("../util/util.js")

var timestamp = 0;
var t1 = 0;
var t2 = 0;
var t3 = 0;

contract('ColorCoin-TestUnlock', accounts => {
  var initialLockedAmount = _100
  var initialBalance = initialLockedAmount
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]

  it("Distribute coins to account[2]", async () => {
    timestamp = Math.floor(new Date().getTime()/1000)
    t1 = timestamp + 2
    t2 = timestamp + 3
    t3 = timestamp + 6

    var contract = await ColorCoin.deployed()
    await contract.distribute(user, _100,
              [new BN(t1), new BN(t2), new BN(t3)],
              [_30, _30, _10],
              {from: founder});
    var result = await contract.balanceOf.call(user)
    console.log("Distribute done, user balance is " + result)
    assert.equalBN(result, _100, "Wrong initial balance");
  })

  it("Check tryUnlock: first lockup period", async () => {
    var msec = t1*1000+100 - new Date().getTime()
    if (msec < 0) {
      assert.fail("Too late")
    }

    let instance = await ColorCoin.deployed();

    let unlock = await instance.nextUnlockDate.call({from: user})
    assert.isTrue(unlock[0], "Should be locked")
    console.log("Seconds left: ", unlock[1]);
    assert.ok(unlock[1].gt(_0));

    await ColorCoin.deployed().delay(msec);
    let tx = await instance.doUnlock({from:user});
    console.log("Transaction sent at: " + new Date().getTime());

    let result = await ColorCoin.deployed()
      .then(instance => instance.getLockedAmount.call({from: user}))
    console.log("Locked amount checked at: " + new Date().getTime());
    console.log("Locked amount after timer: " + result.toString())
    var amountLeft = _100.sub(_30)
    assert.equalBN(result, amountLeft, "Wrong lockedAmount")

    let balance = await ColorCoin.deployed().then(instance => instance.accountBalance.call(user))
    assert.equalBN(balance, _30, "Wrong balance")

    let totalBalance = await ColorCoin.deployed().then(instance => instance.balanceOf.call(user))
    assert.equalBN(totalBalance, _100, "Wrong total balance")

    let circulatingSupply = await instance.circulatingSupply.call();
    assert.equalBN(balance, _30, "Wrong circulating supply")
  })

  it("Check tryUnlock: second lockup period and admin unlock", async () => {
    var msec = t2*1000+100 - new Date().getTime()
    if (msec < 0) {
      assert.fail("Too late")
    }

    let instance = await ColorCoin.deployed();

    let unlock = await instance.nextUnlockDate_Admin.call(user, {from: admin})
    assert.isTrue(unlock[0], "Should be locked")
    console.log("Seconds left: ", unlock[1]);
    assert.ok(unlock[1].gt(_0));

    await ColorCoin.deployed().delay(msec);
    let tx = await instance.doUnlock_Admin(user, {from:admin});
    console.log("Transaction sent at: " + new Date().getTime());

    let result = await ColorCoin.deployed()
      .then(instance => instance.getLockedAmount.call({from: user}))
    console.log("Locked amount checked at: " + new Date().getTime());
    console.log("Locked amount after timer: " + result.toString())
    var amountLeft = _100.sub(_30).sub(_30)
    assert.ok(amountLeft.eq(result),
      "lockedAmount expected " + amountLeft + ", got " + result)

    var expectedBalance = _30.add(_30);
    let balance = await ColorCoin.deployed().then(instance => instance.accountBalance.call(user))
    assert.ok(expectedBalance.eq(balance),
      "Balance expected to be " + expectedBalance + ", got " + balance)
    let totalBalance = await ColorCoin.deployed().then(instance => instance.balanceOf.call(user))
    assert.ok(_100.eq(totalBalance),
      "Total balance expected to be " + _100 + ", got " + totalBalance)
    let circulatingSupply = await instance.circulatingSupply.call();
    assert.equalBN(balance, _60, "Wrong circulating supply")
  })

  it("Check tryUnlock: third lockup period", async () => {
    var msec = t3*1000+100 - new Date().getTime()
    if (msec < 0) {
      assert.fail("Too late")
    }

    let instance = await ColorCoin.deployed();

    let unlock = await instance.nextUnlockDate.call({from: user})
    assert.isTrue(unlock[0], "Should be locked")
    console.log("Seconds left: ", unlock[1]);
    assert.ok(unlock[1].gt(_0));

    await ColorCoin.deployed().delay(msec);
    let tx = await instance.doUnlock({from:user});
    console.log("Transaction sent at: " + new Date().getTime());

    let result = await ColorCoin.deployed()
      .then(instance => instance.getLockedAmount.call({from: user}))
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

  it("Check tryUnlock: after last lockup period", async () => {
    let instance = await ColorCoin.deployed();

    let unlock = await instance.nextUnlockDate.call({from: user})
    assert.isFalse(unlock[0], "Should be locked")
    console.log("Seconds left: ", unlock[1]);
    assert.equalBN(_0, unlock[1]);

    let circulating = await instance.circulatingSupply.call();
    assert.equalBN(circulating, _100, "Wrong circulating supply")
  })

})
