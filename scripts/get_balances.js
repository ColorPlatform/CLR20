const Web3 = require("web3");
const web3 = new Web3('http://localhost:8545')
const BN = web3.utils.BN;
// const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.100.101:8545"));
// const transferEventTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"; // web3.utils.sha3("Transfer(address,address,uint256)");
// const fromBlock = 7218422;
const balances = {};

const ZERO = new BN(0)
const fs = require('fs');

let rawData = fs.readFileSync('transfers.json');
let logs = JSON.parse(rawData);

console.error("Length of the log:", logs.length)

logs.forEach((entry) => {
    var amount = web3.utils.toBN(entry.data)
    var from = "0x"+web3.utils.toBN(entry.topics[1]).toString(16)
    var to = "0x"+web3.utils.toBN(entry.topics[2]).toString(16)

    var fromBalance = balances[from]
    if (typeof fromBalance === "undefined") {
        fromBalance = new BN(0)
    }
    var toBalance = balances[to]
    if (typeof toBalance === "undefined") {
        toBalance = new BN(0)
    }
    fromBalance = fromBalance.sub(amount)
    toBalance = toBalance.add(amount)
    if (fromBalance.lt(ZERO)) {
        fromBalance = new BN(0);
    }
    balances[from] = fromBalance
    balances[to] = toBalance
})

function size(obj) {
    var size = 0
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
console.error("Holders: " + size(balances))
for (var key in balances) {
    var amount = balances[key]
    var val = web3.utils.fromWei(amount, 'ether')
    console.log('"'+key+'",'+val.toString())
}