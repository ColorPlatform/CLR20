require("../util/util.js")

var timestamp = Math.floor(new Date().getTime()/1000)

/*
Test purpose: check that users becomes an investor after sending them coins.

Test scenario:
  1. Distribute coins to a user with several lockup periods
  2.
*/
contract('ColorCoin-TestDistribute', accounts => {
  var founder = accounts[0]
  var admin = accounts[1]
  var user = accounts[2]
  console.log("TestDistribute started: " + new Date().getTime())
  console.log("  Contract address: " + ColorCoin.address);

  // Distribute coins to the user
  it("Distribute coins to account[2]", () => {
    return ColorCoin.deployed()
      .then(contract => {
            contract.distribute(user, _100,
              [new BN(timestamp+3), new BN(timestamp+5), new BN(timestamp+7)],
              [_30, _30, _10],
              {from: founder})
            return contract
      })
      .then(contract => contract.balanceOf.call(user))
      .then(result => console.log("Distribute done, user balance is " + result))
  })
  it('Check investor balance', () => {
    return ColorCoin.deployed()
      .then(contract => contract.balanceOf.call(user))
      .then(result => {
          console.log("Check investor balance: done, balance " + result)
          assert.equalBN(result, _100, "User must have received 100 coins")
      })
    })

    it('Check that the user became an investor', () =>
      ColorCoin.deployed()
        .then(contract => contract.getIsInvestor.call(user))
        .then(result => {
            console.log("Check that the user became an investor: done, result " + result)
            assert.isTrue(result, "User must become an investor")
        })
      )

    it('Check that all coins are locked', () =>
      ColorCoin.deployed()
        .then(contract => contract.accountBalance.call(user))
        .then(result => {
            console.log("Check that all coins are locked: done, result " + result.valueOf())
            assert.equalBN(result, new BN(0), "User must have all coins locked")
        })
    )

    it('Check investor properties', () =>
      ColorCoin.deployed()
        .then(contract => contract.getInvestor(user))
        .then(result => {
          console.log("Check investor properties: done, result is "
            + [result[0], result[1], result[2]])
          // Check initial amount
          assert.equalBN(result[0], _100, "Initial amount must be 100 coins")
          // Check current lockUp period
          assert.equalBN(result[1], new BN(0), "Current lockup period must be 0")
          // Check locked amount
          assert.equalBN(result[2], _100, "Initial locked amount must be 100 coins")
    }))

    it('Check number of lock-up periods', () =>
      ColorCoin.deployed()
        .then(contract => contract.getLockUpSize.call(user))
        .then(result => {
            console.log("Check number of lock-up periods: done, result " + result)
            assert.equal(3, result.valueOf(), "There must have been 3 periods")
          })
      )

    describe("Tests for lockup periods", () => {
      it('Check 1st period', () =>
        ColorCoin.deployed()
          .then(contract => contract.getUnlockData(user, 0))
          .then(result => {
            console.log("Check 1st period: done, result is "
              + [result[0], result[1]])
            // Check unlock date
            assert.equalBN(result[0], new BN(timestamp+3), "Wrong 1st unlock time")
            // Check unlocked amount
            assert.equalBN(result[1], _30, "Wrong unlock amount")
      }))

      it('Check 2nd period', () =>
        ColorCoin.deployed()
          .then(contract => contract.getUnlockData(user, 1))
          .then(result => {
            console.log("Check 1st period: done, result is "
              + [result[0], result[1]])
            // Check unlock date
            assert.equalBN(result[0], new BN(timestamp+5), "Wrong 2nd unlock time")
            // Check unlocked amount
            assert.equalBN(result[1], _30, "Wrong unlock amount")
      }))

      it('Check 3rd period', () =>
        ColorCoin.deployed()
          .then(contract => contract.getUnlockData(user, 2))
          .then(result => {
            console.log("Check 3rd period: done, result is "
              + [result[0], result[1]])
            // Check unlock date
            assert.equalBN(result[0], new BN(timestamp+7), "Wrong 3rd unlock time")
            // Check unlocked amount
            assert.equalBN(result[1], _10, "Wrong unlock amount")
      }))
    })
})
