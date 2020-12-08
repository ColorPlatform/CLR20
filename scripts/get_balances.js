const Web3 = require("web3");
const web3 = new Web3('http://localhost:8545')
const BN = web3.util.BN;
// const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.100.101:8545"));
const transferEventTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"; // web3.utils.sha3("Transfer(address,address,uint256)");
const fromBlock = 7218422;
const balances = {};

console.log("Topic: ", web3.utils.sha3("Transfer(address,address,uint256)"))

web3.eth.getPastLogs({
    fromBlock: fromBlock,
    toBlock: fromBlock+1,
    address:"0x2396fbc0e2e3ae4b7206ebdb5706e2a5920349cb",
    topics: [ transferEventTopic ]
}).then(function (logs){
    console.log("Length of the log:", logs.length)

    logs.forEach((entry) => {
        var amount = web3.utils.toBN(entry.data)
        var from = "0x"+web3.utils.toBN(entry.topics[1]).toString(16)
        var to = "0x"+web3.utils.toBN(entry.topics[2]).toString(16)
        console.log("From: "+ from)
        console.log("To: "+ to)
        console.log("Amount: " + web3.utils.fromWei(amount,'ether').toString())

        var fromBalance = balances[from]
        if (typeof fromBalance === "undefined") {
            fromBalance = new BN(0)
        }
    })

}).catch(function (error) {
    console.error("Error getting logs: " + error);
})
// const filter = web3.eth.filter({
//         fromBlock: fromBlock,
//         topics: [ transferEventTopic ]
//     });

// filter.watch((err, obj) => {
//         if (err) {
//             console.error(err);
//         } else {
//             if (typeof myBalances[obj.address] === "undefined") {
//                 myBalances[obj.address] = web3.toBigNumber(0);
//             }
//             let message = "Token " + obj.address;
//             let changed = false;
//             if (obj.topics[1] == myAddress) {
//                 changed = true;
//                 myBalances[obj.address] = myBalances[obj.address].minus(obj.data);
//                 message += ", Sent " + web3.toBigNumber(obj.data).toString(10);
//             } else if (obj.topics[2] == myAddress) {
//                 changed = true;
//                 myBalances[obj.address] = myBalances[obj.address].plus(obj.data);
//                 message += ", Received " + web3.toBigNumber(obj.data).toString(10);
//             }
//             if (changed) {
//                 message += ", Balance " + myBalances[obj.address].toString(10);
//                 console.log(message);
//             }
//         }
//     });

// process.on('SIGINT', () => {
//     console.log("Stop watching");
//     filter.stopWatching(console.log);
//     process.exit();
// });