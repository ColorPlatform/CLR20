const Web3 = require("web3");
const web3 = new Web3('http://localhost:8545')

const transferEventTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"; // web3.utils.sha3("Transfer(address,address,uint256)");

var fromBlock = 11414108//7218422;


web3.eth.getBlockNumber()
.then(async function (latest) {
    console.error("From: ", fromBlock, " to latest ", latest)
    const step = Math.floor((latest - fromBlock) / 1000)
    var percentage = 0
    while (fromBlock < latest) {
        var logs = await web3.eth.getPastLogs({
            fromBlock: fromBlock,
            toBlock: fromBlock+step,
            address:"0x2396fbc0e2e3ae4b7206ebdb5706e2a5920349cb",
            topics: [ transferEventTopic ]
        })
        logs.forEach((obj) => { console.log(obj, ",") })
        fromBlock += step
        percentage += 1
        console.error(percentage,"%  (", fromBlock, ")")
    }
}).catch((error) => {
    console.error("Latest from block "+fromBlock + ", Error getting logs: " + error);
})
