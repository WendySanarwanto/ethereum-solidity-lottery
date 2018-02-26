const HDWalletProvider = require(`truffle-hdwallet-provider`);
const Web3 = require('web3');
const { bytecode, interface } = require('./compile');
const fs = require('fs');

const DEV_ACCOUNT_MNEMONIC = process.env.ETH_DEV_ACC_MNEMONIC;
const RINKEBY_NODE_URL = process.env.RINKEBY_NODE_URL;
const NODE_URL = RINKEBY_NODE_URL;

const provider = new HDWalletProvider(
  DEV_ACCOUNT_MNEMONIC,
  NODE_URL
);

const GAS = 400000;
const GWEI = 1000000000;
const GAS_PRICE = 50*GWEI; 

const web3 = new Web3(provider);
let account;
let deployedContract;

async function deploy(gas, gasPrice) {
  const accountAddresses = await web3.eth.getAccounts();
  // Should only pick account that has sufficient fund
  let accounts = [];
  for(const accountAddress of accountAddresses) {
    const balance = await web3.eth.getBalance(accountAddress);
    accounts.push({
      address: accountAddress,
      balance: parseInt(balance) / 1e18
    });
  }
  accounts = accounts.sort((left, right)=>right.balance - left.balance);
  console.log(`[DEBUG] - accounts: \n`, JSON.stringify(accounts, " ", 2));
  account = accounts[0];

  console.log(`[INFO] - Attempting to deploy the contract from account: ${account.address}, to ${NODE_URL}`);

  // Should validate account's balance whether it is sufficient against entered gas x gasPrice
  if (account.balance * 1e18 < gas * gasPrice) {
    throw new Error(`The balance of account ${account.address} is not sufficient for deploying the contract.`);
  }
  
  const deployedContract = await new web3.eth.Contract(JSON.parse(interface))
                      .deploy({data: bytecode})
                      .send({gas: gas, gasPrice: gasPrice, from: account.address});
  console.log(`[INFO] - Contract has been deployed to `, deployedContract.options.address);

  onContractDeployed(account, deployedContract);
}

function onContractDeployed(account, deployedContract) {
  // Save account & deployed contract to json file
  const deployedDirPath = `./deployed`;
  const contractAddress = deployedContract.options.address;
  // Create ./deployed folder if it does not exist.
  if (!fs.existsSync(deployedDirPath)) {
    fs.mkdirSync(deployedDirPath);
  }
  const jsonFilePath = `${deployedDirPath}/${account.address}-${contractAddress}.json`;

  // Does the json file exist ?
  if (!fs.existsSync(jsonFilePath)){
    // Nope. Let's create it then
    fs.closeSync(fs.openSync(jsonFilePath, 'w'));
  }
  const data = {account: account, contractAddress: contractAddress};

  fs.writeFileSync(jsonFilePath, JSON.stringify(data));
}

deploy(GAS, GAS_PRICE);

exports.account = account;
exports.deployedContract = deployedContract;