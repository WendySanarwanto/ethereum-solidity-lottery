// "use strict";

const assert = require('assert');
const ganache = require('ganache-cli');                 // 1. Import ganache
const Web3 = require('web3');                           // 2. Import web3
const { interface,  bytecode } = require(`../compile`); // 3. Import compiled contract's interface & bytecode

describe("Lottery Contract", () => {
  const provider = ganache.provider();                  // 4. Get provider object from ganache
  const web3 = new Web3(provider);                      // 5. Instantiate Web3 instance by specified ethereum node (ganache's provider)

  let accounts;
  let lottery;
  
  beforeEach(async () => {
    // Get a list of all accounts from Ganache
    accounts = await web3.eth.getAccounts();            // 6. get available ganache's accounts

    // Use one of these accounts to deploy the contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))            // 7. Instantiate a new web3.eth.Contract instance by specified contract's interface object
                  .deploy({data: bytecode}) // 8. Prepare contract's object to deploy , by specified contract's bytecode and its constructor's arg.
                  .send({from: accounts[0], gas: '1000000'});             // 9. Deploy the contract to blockchain by specified ganache's account and amount of required gas.
    lottery.setProvider(provider);                                         // 10. Associate the ganache's provider object with the deployed contract.
  });

  it(`deploys a contract`, () => {
    // console.log(`[DEBUG] - inbox=\n`, inbox);
    assert.ok(lottery.options.address);
  });

  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[1]
    });

    assert.equal(1, players.length);
    assert.equal(players[0], accounts[1]);
  });

  it('allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.03', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[3],
      value: web3.utils.toWei('0.04', 'ether')
    });


    const players = await lottery.methods.getPlayers().call({
      from: accounts[1]
    });

    assert.equal(3, players.length);
    assert.equal(players[0], accounts[1]);
    assert.equal(players[1], accounts[2]);
    assert.equal(players[2], accounts[3]);
  });

  it(`requires minimum Ether to enter`, async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[4],
        value: 200
      });
      assert(false)
    } catch(err) {
      assert(err);
    }
  });

  it(`requires manager to pick a winnner`, async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[3]
      });
      assert(false);
    } catch(err) {
      assert(err);
    }
  });

  it(`sends money to te winner and resets the players array`, async() => {
    // Arrange
    // Pick a player to enter the lottery
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('2', 'ether')
    });

    // Capture the joined player's initial balance after entered the lottery
    const initialBalance = await web3.eth.getBalance(accounts[2]);

    // Have the manager to pick up the winner
    const manager = accounts[0];    
    await lottery.methods.pickWinner().send({
      from: manager
    });

    // Capture the joined player's final balance
    const finalBalance = await web3.eth.getBalance(accounts[2]);

    // Get diff balance
    const diffBalance = finalBalance - initialBalance;

    // Assert if the money is received by the winner
    assert.ok(diffBalance > web3.utils.toWei('1.8', 'ether'));

    // assert if the players list has been reset.
    const players = await lottery.methods.getPlayers().call();
    assert.ok(players.length === 0);
  });
});