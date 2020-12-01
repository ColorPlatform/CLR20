function delay(t, v) {
   return new Promise(function(resolve) {
       setTimeout(resolve.bind(null, v), t)
   });
}

Promise.prototype.delay = function(t) {
    return this.then(function(v) {
        return delay(t, v);
    });
}

global.ColorCoin = artifacts.require('./TestColorCoin.sol')
global.TransferCLR = artifacts.require('./TransferCLR.sol')

global.BN = web3.utils.BN

global.coin = new BN("1000000000000000000")

global._0 = new BN(0)
global._1 = coin.mul(new BN(1))
global._2 = coin.mul(new BN(2))
global._3 = coin.mul(new BN(3))
global._4 = coin.mul(new BN(4))
global._5 = coin.mul(new BN(5))
global._6 = coin.mul(new BN(6))
global._7 = coin.mul(new BN(7))
global._8 = coin.mul(new BN(8))
global._9 = coin.mul(new BN(9))

global._10 = coin.mul(new BN(10))
global._20 = coin.mul(new BN(20))
global._30 = coin.mul(new BN(30))
global._40 = coin.mul(new BN(40))
global._50 = coin.mul(new BN(50))
global._60 = coin.mul(new BN(60))
global._70 = coin.mul(new BN(70))
global._80 = coin.mul(new BN(80))
global._90 = coin.mul(new BN(90))
global._100 = coin.mul(new BN(100))
global._1000 = coin.mul(new BN(1000))
global._10000 = coin.mul(new BN(10000))

global.initialSupply = coin.mul(new BN(500000000))
global.pixelSupply = coin.mul(new BN(20000000))
global.mintingSpeed = coin.mul(new BN(2))

assert.equalBN = function (act, exp, msg) {
  if (msg) {
    msg += ": expected " + exp + ", got " + act;
  }
  assert(exp.eq(act), msg)
}

assert.gtBN = function (left, right, msg) {
  if (msg) {
    msg += ": expected " + left + " > " + right;
  }
  assert(left.gt(right), msg)
}