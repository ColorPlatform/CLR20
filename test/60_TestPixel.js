require("../util/util.js")
// NodeJS util
var util = require("util")

contract("ColorCoin-TestPixel", function(accounts) {
  var founder = accounts[0]
  var admin = accounts[1]
  var pixel = accounts[9]

  contract("Test setter and getter of pixel conversion rate", function () {
    it("Initially conversion rate is 0", async () => {
      let instance = await ColorCoin.deployed()
      let convRate = await instance.getPixelConversionRate.call()

      assert.equalBN(convRate, _0, "Wrong pixel conversion rate")
    })

    it("Conversion rate is set properly by founder", async () => {
      let instance = await ColorCoin.deployed()
      await instance.setPixelConversionRate(_10, {from: founder})
      let convRate = await instance.getPixelConversionRate.call()

      assert.equalBN(convRate, _10, "Wrong pixel conversion rate")
    })

    it("Conversion rate is set properly by pixel account", async () => {
      let instance = await ColorCoin.deployed()
      await instance.setPixelConversionRate(_20, {from: pixel})
      let convRate = await instance.getPixelConversionRate.call()

      assert.equalBN(convRate, _20, "Wrong pixel conversion rate")
    })

    it("Admin can't set conversion rate", async () => {
      let instance = await ColorCoin.deployed()
      let hadException = false
      let convRate_before = await instance.getPixelConversionRate.call()
      try {
        await instance.setPixelConversionRate(_20, {from: admin})
      } catch(error) {
        console.log("Error caught: " + error);
        hadException = true;
      }
      assert.isTrue(hadException, "Should have thrown an exception")
      // Conversion rate should be the same
      let convRate_after = await instance.getPixelConversionRate.call()
      assert.equalBN(convRate_before, convRate_after, "Wrong pixel conversion rate")
    })
  })

  contract("Test pixel distribution by batch", function () {
    var conversion = 2;
    it("Founder sets pixel conversion rate", async () => {
      let instance = await ColorCoin.deployed()
      await instance.setPixelConversionRate(conversion, {from: founder})
      let convRate = await instance.getPixelConversionRate.call()

      assert.equalBN(convRate, new BN(conversion), "Wrong pixel conversion rate")
    })

    it("Founder distributes coins for pixel by batch", async () => {
      let dst = []
      let pixels = []
      let number = 5
      let total = 0
      for (var i = 0; i < number; i++) {
        let addr = web3.utils.randomHex(20)
        while (addr == founder || addr == pixel) { addr = web3.utils.randomHex(20) }
        dst.push(addr)
        pixels.push(i)
      }

      let instance = await ColorCoin.deployed()
      let pixelBalance_before = await instance.balanceOf.call(pixel)
      await instance.sendCoinsForPixels_Batch(pixels, dst, {from: founder})

      for (var i = 0; i < number; i++) {
        let addr = dst[i]
        let expected = pixels[i] * conversion
        total += expected

        let balance = await instance.balanceOf.call(addr)
        assert.equalBN(balance, new BN(expected), "Wrong balance")
      }

      let pixelBalance_after = await instance.balanceOf.call(pixel)

      assert.equalBN(pixelBalance_after, pixelBalance_before.sub(new BN(total)),
        "Wrong balance of pixel account"
      )
    })
  })

  contract("Test pixel distribution by array", function() {
    var conversion = 2;
    it("Founder sets pixel conversion rate", async () => {
      let instance = await ColorCoin.deployed()
      await instance.setPixelConversionRate(conversion, {from: founder})
      let convRate = await instance.getPixelConversionRate.call()

      assert.equalBN(convRate, new BN(conversion), "Wrong pixel conversion rate")
    })

    it("Founder distributes coins for pixel", async () => {
      let pixels = 3
      let expected = new BN(pixels * conversion)
      let dst = []
      let number = 5
      for (var i = 0; i < number; i++) {
        let addr = web3.utils.randomHex(20)
        while (addr == founder || addr == pixel) { addr = web3.utils.randomHex(20) }
        dst.push(addr)
      }

      let instance = await ColorCoin.deployed()
      let pixelBalance_before = await instance.balanceOf.call(pixel)
      await instance.sendCoinsForPixels_Array(pixels, dst, {from: founder})

      for (var i = 0; i < number; i++) {
        let addr = dst[i]
        let balance = await instance.balanceOf.call(addr)
        assert.equalBN(balance, expected, "Wrong balance")
      }

      let total = expected*dst.length
      let pixelBalance_after = await instance.balanceOf.call(pixel)
      assert.equalBN(pixelBalance_after, pixelBalance_before.sub(new BN(total)),
        "Wrong balance of pixel account"
      )

    })
  })

  // contract("Estimations of gas usage", function () {
  //   it("Founder sets pixel conversion rate", async () => {
  //     let instance = await ColorCoin.deployed()
  //     await instance.setPixelConversionRate(_3, {from: founder})
  //     let convRate = await instance.getPixelConversionRate.call()
  //
  //     assert.equalBN(convRate, _3, "Wrong pixel conversion rate")
  //   })
  //
  //   it("Examine gas used by sendCoinsForPixels_Batch", async () => {
  //     let instance = await ColorCoin.deployed()
  //     let dst = []
  //     let pixels = []
  //
  //     let addAddresses = function (number) {
  //       for (var i = 0; i < number; i++) {
  //         let addr = web3.utils.randomHex(20)
  //         while (addr == founder || addr == pixel) { addr = web3.utils.randomHex(20) }
  //         dst.push(addr)
  //         let amount = 1+Math.floor(100*Math.random())
  //         pixels.push(amount)
  //       }
  //     }
  //
  //     for (let i = 0; i < 10; i++) {
  //       addAddresses(5)
  //       let tx = await instance.sendCoinsForPixels_Batch(pixels, dst, {from: pixel})
  //       let gas = tx.receipt.gasUsed
  //       let tx2 = await web3.eth.getTransaction(tx.tx)
  //       console.log(""+dst.length + "\t" + gas + "\t" + tx2.input.length)
  //     }
  //   })
  //
  //   it("Examine gas used by sendCoinsForPixels_Array", async () => {
  //     console.log("Estimatio for address");
  //     let instance = await ColorCoin.deployed()
  //     let dst = []
  //     let addAddresses = function (number) {
  //       for (var i = 0; i < number; i++) {
  //         let addr = web3.utils.randomHex(20)
  //         while (addr == founder || addr == pixel) { addr = web3.utils.randomHex(20) }
  //         dst.push(addr)
  //       }
  //     }
  //
  //     for (let i = 0; i < 10; i++) {
  //       addAddresses(5)
  //       let tx = await instance.sendCoinsForPixels_Array(2, dst, {from: pixel})
  //       let gas = tx.receipt.gasUsed
  //       let tx2 = await web3.eth.getTransaction(tx.tx)
  //       console.log(""+dst.length + "\t" + gas + "\t" + tx2.input.length)
  //     }
  //   })
  // })
})
