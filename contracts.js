import { algorithmicStockTrader3 } from "contracts/algorithmicStockTrader.js";
import { subarrayWithMaximumSum } from "contracts/subarrayWithMaximumSum.js";
import { totalWaysToSum } from "contracts/totalWaysToSum.js";

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

  for (let i = 0; i < contracts.length; i++) {
    ns.tprintf("\n\n");
    ns.tprintf("vvvvvvvvvvvvvvvvvvvvvv");
    solveContract(ns, contracts[i]);
    ns.tprintf("^^^^^^^^^^^^^^^^^^^^^^");
  }
}

/** @param {NS} ns **/
function solveContract(ns, contract) {
  ns.tprintf("reviewing contract %s on host %s", contract.file, contract.host);
  ns.tprintf("type: %s", contract.type);

  const solver = getSolver(ns, contract);
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
function getSolver(ns, contract) {
  switch (contract.type) {
    // case "Algorithmic Stock Trader III":
    // 	return algorithmicStockTrader3;
    // case "Subarray with Maximum Sum":
    // 	return subarrayWithMaximumSum;
    // case "Total Ways to Sum":
    // 	return totalWaysToSum;

    // case "Algorithmic Stock Trader IV":
    // 	return algorithmicStockTrader4;
    // case "Array Jumping Game":
    // 	return arrayJumpingGame;
    // case "Merge Overlapping Intervals":
    // 	return mergeOverlappingIntervals;
    // case "Minimum Path Sum in a Triangle":
    // 	return minimumPathSumTriangle;
    // case "Unique Paths in a Grid II":
    // 	return uniquePathsGrid2;
    default:
      ns.tprintf("Contract type '%s' unrecognized!", contract.type);
      printContractHelp(ns, contract);
      return function (ns, data) { return false; };
  }
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
/** @return A list of hostnames */
function scanAll(ns) {
  let scanning = ["home"];
  let scannedAll = false;

  // each scanning target is checked against the queued list
  // for a scanning target not in the queued list, that target
  // is added to the queued list, and that target is scanning
  // itself (with its scans added to the scanning list)
  while (!scannedAll) {
    const originalLength = scanning.length;
    let i = 0;
    while (i < originalLength) {
      const root = scanning[i];
      const leaves = ns.scan(root);
      for (let j = 0; j < leaves.length; j++) {
        const leaf = leaves[j]
        if (!scanning.includes(leaf)) {
          scanning.push(leaf);
        }
      }
      i++;
    }

    if (originalLength == scanning.length) {
      scannedAll = true;
      // } else {
      // 	ns.tprint("going around again");
      // 	ns.tprint(scanning);
    }
  }

  return scanning;
}

/** @param {NS} ns **/
function printContractHelp(ns, contract) {
  ns.tprintf("contract description:");
  ns.tprintf("%s", contract.description);
  ns.tprintf("contract data: %v (%s)", contract.data, typeof contract.data);
  ns.tprintf("number of tries remaining: %d", contract.numTries);
}
