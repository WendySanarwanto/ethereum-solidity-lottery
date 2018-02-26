'use strict';

const path = require('path');
const fs = require('fs');
const solc = require('solc');
const CONTRACT_NAME = 'Lottery';
const resolvedContractSolFilePath = path.resolve(__dirname, 'contracts', `${CONTRACT_NAME}.sol`);

const contractContent = fs.readFileSync(resolvedContractSolFilePath, 'utf8');
let compiledContract = solc.compile(contractContent, 1);
compiledContract = compiledContract.contracts[`:${CONTRACT_NAME}`];
console.log(`[DEBUG] - <compile> compiledContract: \n`, compiledContract);

module.exports = compiledContract;
