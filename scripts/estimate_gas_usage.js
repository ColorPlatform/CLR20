
const fs = require('fs');
const Web3 = require("web3");
// ganache
const web3 = new Web3('http://localhost:7545')
const BN = web3.utils.BN


// founder: private key e486593562feed2d9803c151e304e03c21279852757d5bf7e7d2f963d680e7e4
// address: 0x61d08610CA0d5E3eb6978687abb8690b93559E65
var founder = web3.eth.accounts.privateKeyToAccount('0xe486593562feed2d9803c151e304e03c21279852757d5bf7e7d2f963d680e7e4');
const colorCoinJson = JSON.parse(fs.readFileSync('CLR20/build/contracts/ColorCoin.json'));
const colorCoin = new web3.eth.Contract(colorCoinJson.abi)

// pixel account: 0x73c56EBbF0Aedb7bbe0293e45536FC96442425ab
// private key: e18f61672939a2aa56312de65ad3798dfb9bd65c8ce3c3183bc694f27c7e159f
const pixel = web3.eth.accounts.privateKeyToAccount('0xe18f61672939a2aa56312de65ad3798dfb9bd65c8ce3c3183bc694f27c7e159f');

// TransferCLR: 
// Transfer owner: 0x4838FdC28D8b3A0b722eD7328E68cDEf58e4279b
// private key: 01a392fb64674726651c763f1ed884cfee9845694e95f6576f22eee7e86a06b1
var transferOwner = web3.eth.accounts.privateKeyToAccount('0x01a392fb64674726651c763f1ed884cfee9845694e95f6576f22eee7e86a06b1');
const transferCLRJson = JSON.parse(fs.readFileSync('CLR20/build/contracts/TransferCLR.json'));
const transferCLR = new web3.eth.Contract(transferCLRJson.abi)

founder.gasPrice = web3.utils.toWei("60", "gwei")
transferOwner.gasPrice = web3.utils.toWei("60", "gwei")

console.info("Founder: ", founder.address);
console.info("Transfer owner: ", transferOwner.address);

async function ethBalance(address) {
    var value = await web3.eth.getBalance(address);
    return value;
}

async function deploy(contractName, contractArgs, account) {
    const truffleJson = JSON.parse(fs.readFileSync("CLR20/build/contracts/" + contractName + ".json"));
    const contract = new web3.eth.Contract(truffleJson.abi);
    const options = {data: truffleJson.bytecode, arguments: contractArgs};
    const transaction = contract.deploy(options);

    const receipt = await send(transaction, account);
    console.log("Contract " + contractName + " deploy receipt:", receipt);
    return new web3.eth.Contract(truffleJson.abi, receipt.contractAddress);
}

async function send(transaction, account) {
    const options = {
        to   : transaction._parent._address,
        data : transaction.encodeABI(),
        gas  : 6721974, // truffle gas limit
        gasPrice: account.gasPrice
    };
    const signedTransaction  = await web3.eth.accounts.signTransaction(options, account.privateKey);
    const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    return transactionReceipt;
}

async function deploy_full() {
    console.log("Full color coin")

    var nonce = await web3.eth.getTransactionCount(founder.address)
    var initialFounderBalance = await ethBalance(founder.address);
    var colorCoinInstance = await deploy(
        "ColorCoin",
        [
            // uint256 _totalSupply,
            // address payable _founder,
            // address _admin,
            // uint256 _mintSpeed,
            // uint256 _pixelCoinSupply,
            // address _pixelAccount
            web3.utils.toWei('500000000', 'ether'),
            founder.address,
            founder.address,
            '0',
            '0',
            pixel.address
        ],
        founder
    );
    var newFounderBalance = await ethBalance(founder.address);

    var cost = web3.utils.fromWei(
        new BN(initialFounderBalance).sub(new BN(newFounderBalance)),
        'ether'
    )
    console.info(`Cost: ${cost.toString()}`);

    console.info(`Founder balances: before ${initialFounderBalance} (${typeof initialFounderBalance}) and after ${newFounderBalance}`)
    console.info(`Color coin address: ${colorCoinInstance.options.address}`)
    return colorCoinInstance
}

async function deploy_no_pixel() {
    console.log("No pixel")
    var nonce = await web3.eth.getTransactionCount(founder.address)
    var initialFounderBalance = await ethBalance(founder.address);
    var colorCoinInstance = await deploy(
        "ColorCoinBase",
        [
            // uint256 _totalSupply,
            // address payable _founder,
            // address _admin,
            // uint256 _mintSpeed,
            web3.utils.toWei('500000000', 'ether'),
            founder.address,
            founder.address,
            '0',
        ],
        founder
    );
    var newFounderBalance = await ethBalance(founder.address);

    var cost = web3.utils.fromWei(
        new BN(initialFounderBalance).sub(new BN(newFounderBalance)),
        'ether'
    )
    console.info(`Cost: ${cost.toString()}`);
    console.info(`Founder balances: before ${initialFounderBalance} (${typeof initialFounderBalance}) and after ${newFounderBalance}`)
    console.info(`Color coin address: ${colorCoinInstance.options.address}`)
    return colorCoinInstance
}

async function deploy_transfer(colorCoinAddress) {
    console.log("TransferCLR")
    var nonce = await web3.eth.getTransactionCount(transferOwner.address)
    var initialBalance = await ethBalance(transferOwner.address);
    var transferCLRInstance = await deploy(
        "TransferCLR",
        [
            // ColorCoin addr
            colorCoinAddress
        ],
        transferOwner
    );
    var newBalance = await ethBalance(transferOwner.address);

    var cost = web3.utils.fromWei(
        new BN(initialBalance).sub(new BN(newBalance)),
        'ether'
    )
    console.info(`Cost: ${cost.toString()}`);
    console.info(`Transfer owner balances: before ${initialBalance} (${typeof initialBalance}) and after ${newBalance}`)
    console.info(`TrnsferCLR address: ${transferCLRInstance.options.address}`)

    return transferCLRInstance
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function cost(initial, final) {
    return web3.utils.fromWei(
        new BN(initial).sub(new BN(final)),
        'ether'
    )
}

function fillParams(totalNumber, sliceSize) {
    result = {
        params: [],
        total: 0
    }

    for (var n =0; n < totalNumber; n+= sliceSize) {
        var amounts = []
        var addresses = []

        var lim = Math.min(sliceSize, totalNumber - n)
        for (var j = 0; j < lim; j++) {
            addresses.push(web3.utils.randomHex(20))
            var clrs = getRandomInt(100, 10000)
            result.total += clrs;
            amounts.push(web3.utils.toWei(new BN(clrs), 'ether').toString())    
        }
        result.params.push({
            addresses: addresses,
            amounts: amounts
        })
    }

    return result
}

async function run() {
    transferOwner.initialBalance = await ethBalance(transferOwner.address);
    founder.initialBalance = await ethBalance(founder.address);
    
    var colorCoin = await deploy_full()
    var transferCLR = await deploy_transfer(colorCoin.options.address)
    var total = 0;

    var totalNum = 2335
    transferParams = fillParams(totalNum, 30)

    var allowance = 2335*10000; // transferParams.total
    console.log("Approve spending: ", allowance, "to " , transferCLR.options.address)

    var receipt = await colorCoin.methods.approve(
        transferCLR.options.address,
        web3.utils.toWei(new BN(allowance), 'ether').toString()
    ).send({
        from: founder.address,
        gasPrice: web3.utils.toWei('90', 'gwei'),
        gas: 6721974
    });
    console.log("Approve receipt: ", receipt)

    receipt = await colorCoin.methods.enableTransfer(
    ).send({
        from: founder.address,
        gasPrice: web3.utils.toWei('90', 'gwei'),
        gas: 6721974
    });
    console.log("enableTransfer receipt: ", receipt)

    for (var i = 0; i < transferParams.params.length; i++) {
        var params = transferParams.params[i];
        try {
            receipt = await transferCLR.methods.transfer_Batch(founder.address, params.addresses, params.amounts).send(
                {
                    from: transferOwner.address,
                    gasPrice: web3.utils.toWei('90', 'gwei'),
                    gas: 6721974
                }
            )
            var receiptClone = Object.assign({}, receipt);
            receiptClone.events = "Events removed"
            console.log("Receipt of batch transfer: ", receiptClone)
        }catch(error) {
            console.error(error)
        }
    }

    transferOwner.finalBalance = await ethBalance(transferOwner.address);
    founder.finalBalance = await ethBalance(founder.address);

    transferOwner.cost = cost(transferOwner.initialBalance, transferOwner.finalBalance)
    founder.cost = cost(founder.initialBalance, founder.finalBalance)

    console.log("Founder costs: ", founder.cost)
    console.log("TransferOwner costs: ", transferOwner.cost)
}

run()