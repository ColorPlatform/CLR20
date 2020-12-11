# CLR20

The second version of ERC20 token for Color Coin(CLR)

The first version is deployed here: https://etherscan.io/token/0x2396fbc0e2e3ae4b7206ebdb5706e2a5920349cb

## Tests

##### 1. Install [Truffle](https://truffleframework.com/)
```
npm install -g truffle
```
##### 2. Launch Ethereum Client ([Ganache](https://truffleframework.com/ganache))
##### 3. Run javascript test files:
```
truffle test
```
##### 4. Check all tests have passed  

###### 4.1 If some tests failed with '"before all" hook' error

Sometimes network connection to Ganache times out, and some of the tests fail with the error `"before all" hook` and details
```
     ProviderError: 
Could not connect to your Ethereum client with the following parameters:
    - host       > 127.0.0.1
    - port       > 7545
    - network_id > 5777
Please check that your Ethereum client:
    - is running
    - is accepting RPC connections (i.e., "--rpc" option is used in geth)
    - is accessible over the network
    - is properly configured in your Truffle configuration file (truffle-config.js)
```

In such case launch tests one by one.
Sample command line for Powershell:
```
truffle compile
(ls .\test\*.js).FullName | foreach { echo $_; echo "`n**********`n"; echo ""; truffle test $_ --compile-none ; echo "`n**********`n`n"} | tee .\test.log
```