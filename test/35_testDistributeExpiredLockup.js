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
    t1 = timestamp - 10
    t2 = timestamp + 3
    t3 = timestamp + 6

    var contract = await ColorCoin.deployed()
    await contract.distribute(user, _100,
              [new BN(t1), new BN(t2), new BN(t3)],
              [_100, _30, _10],
              {from: founder});
    var result = await contract.balanceOf.call(user)
    console.log("Distribute done, user balance is " + result)
    assert.equalBN(result, _100, "Wrong initial balance");
    result = await contract.getLockedAmount.call({from: user});
    assert.equalBN(result, _0, "Must have unlocked");
  })
})
