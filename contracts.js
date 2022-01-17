import { algorithmicStockTrader1, algorithmicStockTrader3 } from "contracts_algorithmicStockTrader.js";
import { findAllValidMathExpressions } from "contracts_findAllValidMathExpressions.js";
import { generateIPAddresses } from "contracts_generateIPAddresses.js";
import { mergeOverlappingIntervals } from "contracts_mergeOverlappingIntervals.js";
import { minimumPathSumTriangle } from "contracts_minimumPathSumTriangle.js";
import { spiralizeMatrix } from "contracts_spiralizeMatrix.js";
import { subarrayWithMaximumSum } from "contracts_subarrayWithMaximumSum.js";
import { totalWaysToSum } from "contracts_totalWaysToSum.js";
import { scanAll } from "util_recurse.js";

// If the number of attempts is <= this number, we won't submit our proposed answer
const attemptsThreshold = 3;

const exitOnFail = false;

/** @param {NS} ns **/
export async function main(ns) {
  const contracts = findContracts(ns);
  ns.tprintf("Found %d contracts", contracts.length);

  if (contracts.length == 0) {
    return;
  }

  let numWon = 0;
  let numPassed = 0;
  let numFailed = 0;
  const goAll = await ns.prompt("Yes to run all. No to run one by one.");
  for (let i = 0; i < contracts.length; i++) {
    ns.tprintf("\n\n");
    ns.tprintf("vvvvvvvvvvvvvvvvvvvvvv");
    let score = solveContract(ns, contracts[i]);
    ns.tprintf("^^^^^^^^^^^^^^^^^^^^^^");

    if (score == 1) numWon++;
    else if (score == 0) numPassed++;
    else if (score == -1) {
      numFailed++;
      if (exitOnFail) break;
    } else {
      ns.tprintf("bad solver exit code: %v. See above logs", score);
      break;
    }

    if (goAll) continue;
    const another = await ns.prompt("Yes to do another. No to cancel.");
    if (!another) break;
  }
  ns.tprintf("%d won, %d passed, %d failed", numWon, numPassed, numFailed)
}

/** @param {NS} ns **/
/** @returns 1 if the contract was solved successfully, 0 if the contract was not attempted, -1 if the contract was attempted and failed, -2 if there was a bigger problem */
function solveContract(ns, contract) {
  ns.tprintf("reviewing contract %s on host %s", contract.file, contract.host);
  ns.tprintf("type: %s", contract.type);

  // const solver = getSolver(ns, contract);
  let solver;
  switch (contract.type) {
    case "Algorithmic Stock Trader I":
      solver = algorithmicStockTrader1;
      break;
    case "Algorithmic Stock Trader III":
      solver = algorithmicStockTrader3;
      break;
    case "Find All Valid Math Expressions":
      solver = findAllValidMathExpressions;
      break;
    case "Generate IP Addresses":
      solver = generateIPAddresses;
      break;
    case "Merge Overlapping Intervals":
      solver = mergeOverlappingIntervals;
      break;
    case "Minimum Path Sum in a Triangle":
      solver = minimumPathSumTriangle;
      break;
    case "Spiralize Matrix":
      solver = spiralizeMatrix;
      break;
    case "Subarray with Maximum Sum":
      solver = subarrayWithMaximumSum;
      break;
    // case "Total Ways to Sum":
    //   solver = totalWaysToSum;
    //   break;

    // case "Algorithmic Stock Trader IV":
    // 	solver = algorithmicStockTrader4;
    //  break;
    // case "Array Jumping Game":
    // 	solver = arrayJumpingGame;
    //  break;
    // case "Merge Overlapping Intervals":
    // 	solver = mergeOverlappingIntervals;
    //  break;
    // case "Unique Paths in a Grid II":
    // 	solver = uniquePathsGrid2;
    //  break;
    default:
      ns.tprintf("Contract type '%s' unrecognized!", contract.type);
      printContractHelp(ns, contract);
      return 0;
  }

  let proposal;
  try {
    proposal = solver(ns, contract.data);
  } catch (e) {
    ns.tprintf("caught exception from solver: %v", e);
    printContractHelp(ns, contract);
    return -2;
  }

  ns.tprintf("proposed answer: %v", proposal);

  if (proposal === false) {
    ns.tprintf("Proposal returned false. Please return a proposal in order to attempt the contract automatically.");
    printContractHelp(ns, contract);
    return 0;
  }

  if (contract.numTries <= attemptsThreshold) {
    ns.tprintf("Contract has %d tries remaining! You'll have to solve it manually.", contract.numTries);
    printContractHelp(ns, contract);
    return 0;
  }

  const reward = ns.codingcontract.attempt(proposal, contract.file, contract.host, { "returnReward": true });
  if (reward.length == 0) {
    ns.tprintf("Incorrect!");
    contract.numTries--;
    printContractHelp(ns, contract);
    return -1;
  }

  ns.tprintf("Correct! Reward: %s", reward);
  return 1;
}

/** @param {NS} ns **/
function findContracts(ns) {
  const servers = scanAll(ns);
  // ns.tprintf("Scanned %d servers", servers.length);

  let contracts = [];
  for (let i = 0; i < servers.length; i++) {
    const host = servers[i];
    const files = ns.ls(host);
    for (let j = 0; j < files.length; j++) {
      const file = files[j];
      // ns.tprintf("  %s", files[j]);
      if (files[j].endsWith(".cct")) {
        let contract = {
          file: file,
          host: host,
          numTries: ns.codingcontract.getNumTriesRemaining(file, host),
          description: ns.codingcontract.getDescription(file, host),
          data: ns.codingcontract.getData(file, host),
          type: ns.codingcontract.getContractType(file, host)
        };
        contracts.push(contract);
      }
    }
  }
  return contracts;
}

/** @param {NS} ns **/
function printContractHelp(ns, contract) {
  ns.tprintf("contract description:");
  ns.tprintf("%s", contract.description);
  let length;
  try {
    length = contract.data.length;
  } catch (e) {
    length = -1;
  }
  if (typeof length == "undefined") {
    length = -1;
  }
  ns.tprintf("contract data: %v (%s, %d long)", contract.data, typeof contract.data, length);
  ns.tprintf("number of tries remaining: %d", contract.numTries);
}
