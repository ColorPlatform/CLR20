const Web3 = require("web3");
const web3 = new Web3('http://localhost:8545')
const BN = web3.utils.BN
const padLeft = web3.utils.padLeft

let tokenAddress = "0x2396fbc0e2e3ae4b7206ebdb5706e2a5920349cb";
// let walletAddress = "0xad285fdedfc0d5f944a33e478356524293c7ec68";

// The minimum ABI to get ERC20 Token balance
let minABI = [
  // balanceOf
  {
    "constant":true,
    "inputs":[{"name":"_owner","type":"address"}],
    "name":"balanceOf",
    "outputs":[{"name":"balance","type":"uint256"}],
    "type":"function"
  },
  // decimals
  {
    "constant":true,
    "inputs":[],
    "name":"decimals",
    "outputs":[{"name":"","type":"uint8"}],
    "type":"function"
  }
];

const contract = new web3.eth.Contract(minABI, tokenAddress)

const fs = require('fs');

let rawData = fs.readFileSync('transfers.json');
let logs = JSON.parse(rawData);
let addresses = {}
logs.forEach((entry) => {
    var from = padLeft("0x"+web3.utils.toBN(entry.topics[1]).toString(16), 40)
    var to = padLeft("0x"+web3.utils.toBN(entry.topics[2]).toString(16), 40)

    addresses[from] = 1
    addresses[to] = 1
})

var balances = {}

async function balanceOf(addr) {
    var balance = await contract.methods.balanceOf(addr).call();

    var balanceStr = balance.toString()
    var amt = '';
    if (balanceStr.length > 18) {
        var integer = balanceStr.substring(0, balanceStr.length-18)
        var fract = balanceStr.substring(balanceStr.length-18, balanceStr.length)
        amt = integer+"."+fract
    } else {
        amt = "0." + padLeft(balanceStr, 18)
    }
    console.log(""+addr+","+balance.toString()+","+amt);
}

async function run() {
    for (var addr in addresses) {
        // Call balanceOf function
        try {
            await balanceOf(addr)
        } catch(error) {
            console.error(error)
        }
        // break
    }
}

run()