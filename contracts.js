import { algorithmicStockTrader1, algorithmicStockTrader3 } from "contracts/algorithmicStockTrader.js";
import { minimumPathSumTriangle } from "contracts/minimumPathSumTriangle.js";
import { subarrayWithMaximumSum } from "contracts/subarrayWithMaximumSum.js";
import { totalWaysToSum } from "contracts/totalWaysToSum.js";
import { scanAll } from "util/recurse.js";

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length > 0) {
    ns.tprintf("Args supplied! Testing mode");
    // const numWays = solveTotalWaysToSum(ns, ns.args[0]);
    // ns.tprintf("%d unique ways to sum to %d", numWays, ns.args[0]);
    return;
  }

  const contracts = findContracts(ns);
  ns.tprintf("Found %d contracts", contracts.length);

  const goAll = await ns.prompt("Yes to run all. No to run one by one.");
  for (let i = 0; i < contracts.length; i++) {
    ns.tprintf("\n\n");
    ns.tprintf("vvvvvvvvvvvvvvvvvvvvvv");
    solveContract(ns, contracts[i]);
    ns.tprintf("^^^^^^^^^^^^^^^^^^^^^^");

    if (goAll) continue;
    const another = await ns.prompt("Yes to do another. No to cancel.");
    if (!another) break;
  }
}

/** @param {NS} ns **/
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
    case "Minimum Path Sum in a Triangle":
      solver = minimumPathSumTriangle;
      break;
    case "Subarray with Maximum Sum":
      solver = subarrayWithMaximumSum;
      break;
    case "Total Ways to Sum":
      solver = totalWaysToSum;
      break;

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
      return;
  }

  let proposal;
  try {
    proposal = solver(ns, contract.data);
  } catch (e) {
    ns.tprintf("caught exception from solver: %v", e);
    printContractHelp(ns, contract);
    return;
  }

  ns.tprintf("proposed answer: %v", proposal);

  if (proposal === false) {
    ns.tprintf("Proposal returned false. Please return a proposal in order to attempt the contract automatically.");
    printContractHelp(ns, contract);
    return;
  }

  if (contract.numTries <= 5) {
    ns.tprintf("Contract has %d tries remaining! You'll have to solve it manually.", contract.numTries);
    printContractHelp(ns, contract);
    return;
  }

  const reward = ns.codingcontract.attempt(proposal, contract.file, contract.host, { "returnReward": true });
  if (reward.length == 0) {
    ns.tprintf("Incorrect!");
    contract.numTries--;
    printContractHelp(ns, contract);
    return;
  }

  ns.tprintf("Correct! Reward: %s", reward);
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
