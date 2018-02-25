'use strict';

const path = require('path');
const fs = require('fs');
const solc = require('solc');

const resolvedInboxSolPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');

const contractContent = fs.readFileSync(resolvedInboxSolPath, 'utf8');
const compiledContract = solc.compile(contractContent, 1);
const inboxCompiledContract = compiledContract.contracts[':Inbox'];

module.exports = inboxCompiledContract;
