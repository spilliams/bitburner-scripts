import { getNumPortScriptsAvailable } from "target.js";
import { formatMoney } from "util_formatMoney.js";
import { scanAll } from "util_recurse.js";
import { breakIt } from "infect.js";

// args: target

const bufferMS = 500; // time between tasks in a batch
const minBatchBufferMS = 100; // min time between batches
const predictiveBatchTiming = false; // if off, just delay the minBatchBufferMS between batches
const portFullWaitMS = 2000;
const toastOnPortFull = false;

const botPort = 1;
const helperPayload = "4.js";
const maxBotsPerHost = 40;
const useOnlyPurchasedServers = true;
const fillBotServer = true; // whether to maximize each bot server (run payload multi-threaded)
const takeItWaitMS = 50; // time bw bot spinups (many bots per host)

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length !== 1) {
    ns.tprintf("script requires exactly 1 arg: the hostname of a target");
    return;
  }
  const target = ns.args[0];

  // first, make sure I can hack it
  const valid = await targetValid(ns, target)
  if (!valid) return;

  // clear the queue, in case it's got old jobs in it
  ns.clearPort(botPort);

  // build a pool of bots.
  // a bot is a single-threaded run of payload on a server
  let servers;
  if (useOnlyPurchasedServers) servers = ns.getPurchasedServers();
  else servers = scanAll(ns);
  ns.tprintf("Scanned %d servers", servers.length);
  const numBots = await setupHelperPool(ns, servers);
  ns.tprintf("%d bots in the pool", numBots);

  await prepareTarget(ns, target, numBots);

  ns.tprintf("T1M3 7O H4CK");
  while (true) {
    await hackTarget(ns, target, numBots);
  }
}

/** @param {NS} ns **/
async function targetValid(ns, hostname) {
  const currentHackingSkill = ns.getHackingLevel();
  const requiredHackingSkill = ns.getServerRequiredHackingLevel(hostname);
  if (currentHackingSkill < requiredHackingSkill) {
    ns.tprintf("cannot hack target %s: need hack level %d", hostname, requiredHackingSkill);
    return false;
  }
  const numPortScripts = getNumPortScriptsAvailable(ns);
  const requiredPortsOpen = ns.getServerNumPortsRequired(hostname);
  if (numPortScripts < requiredPortsOpen) {
    ns.tprintf("cannot hack target %s: need %d port scripts", hostname, requiredPortsOpen);
    return false;
  }
  return await breakIt(ns, hostname);
}

/** @param {NS} ns **/
async function setupHelperPool(ns, servers) {
  let numBots = 0;
  for (let i = 0; i < servers.length; i++) {
    const host = servers[i];
    if (host == "home") {
      continue;
    }
    const broken = await breakIt(ns, host);
    if (!broken) {
      continue;
    }

    let bots = await takeIt(ns, host, helperPayload, [botPort, host]);
    ns.tprintf("started %d bots on %s (%d/%d)", bots, host, i + 1, servers.length);
    numBots += bots;
  }
  return numBots;
}

/** @param {NS} ns **/
/** @return Whether it executed the payload on the host **/
async function takeIt(ns, host, payload, args = []) {
  await ns.killall(host);
  // todo: test this logic, I'm pretty sure it's wrong when fillBotServer is false
  const availableRAM = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
  const availableThreads = Math.floor(availableRAM / ns.getScriptRam(payload));
  const numBots = Math.min(availableThreads, maxBotsPerHost);
  const threadsPerBot = Math.floor(availableThreads / numBots);
  if (!fillBotServer) threadsPerBot = 1;
  const suffixLen = Math.ceil(Math.log10(numBots));
  for (let i = 0; i < numBots; i++) {
    await ns.scp(payload, "home", host);
    let newName = payload.split(".")[0] + "-" + pad(i, suffixLen) + "." + payload.split(".")[1];
    ns.mv(host, payload, newName);
    ns.exec(newName, host, threadsPerBot, ...args);
    await ns.sleep(takeItWaitMS);
  }

  return numBots;
}

/** @param {NS} ns **/
async function prepareTarget(ns, target, pool) {
  ns.tprintf("Preparing target %s", target);

  const growMS = ns.getGrowTime(target);
  const weakMS = ns.getWeakenTime(target);
  const batchMS = Math.max(
    2 * bufferMS + growMS,
    bufferMS + weakMS
  );
  const hotMS = 2 * bufferMS;
  let concurrentBatches = Math.ceil(batchMS / hotMS);
  ns.tprintf("grow time is %dms", growMS);
  ns.tprintf("weaken time is %dms", weakMS);
  ns.tprintf("batch time (GW) is %fs total, %dms hot (%f%% hot)", (batchMS / 1000.0).toFixed(3), hotMS, (100 * hotMS / batchMS).toFixed(2));
  ns.tprintf("I want to run %d batches at once (%d bots)", concurrentBatches, 2 * concurrentBatches);
  let batchBufferMS = minBatchBufferMS;
  if (predictiveBatchTiming && 2 * concurrentBatches > pool.length) {
    concurrentBatches = Math.floor(pool.length / 2);
    batchBufferMS = Math.ceil(batchMS / concurrentBatches);
    ns.tprintf("Since I only have %d bots (%d max concurrent batches), I have to set the inter-batch buffer to %dms", pool.length, concurrentBatches, batchBufferMS);
  }
  ns.tprintf("batch buffer: %dms", batchBufferMS);
  const tasks = [
    {
      "delayMS": batchMS - 2 * bufferMS - growMS,
      "verb": "grow",
      "target": target
    },
    {
      "delayMS": batchMS - bufferMS - weakMS,
      "verb": "weaken",
      "target": target
    }
  ]

  while (!targetPrepared(ns, target)) {
    await runBatch(ns, tasks);
    // ns.tprintf("  done, sleeping for %dms", batchBufferMS);
    await ns.sleep(batchBufferMS);
  }
}

/** @param {NS} ns **/
async function hackTarget(ns, target, pool) {
  const growMS = ns.getGrowTime(target);
  const weakMS = ns.getWeakenTime(target);
  const hackMS = ns.getHackTime(target);
  const batchMS = Math.max(
    4 * bufferMS + weakMS,
    3 * bufferMS + growMS,
    bufferMS + hackMS
  );
  const hotMS = 4 * bufferMS;
  let concurrentBatches = Math.ceil(batchMS / hotMS);
  // ns.tprintf("grow time is %dms", growMS);
  // ns.tprintf("weaken time is %dms", weakMS);
  // ns.tprintf("hack time is %dms", hackMS);
  // ns.tprintf("batch time (WGWH) is %fs total, %dms hot (%f%% hot)", (batchMS / 1000.0).toFixed(3), hotMS, (100 * hotMS / batchMS).toFixed(2));
  // ns.tprintf("I want to run %d batches at once (%d helpers)", concurrentBatches, 4 * concurrentBatches);
  let batchBufferMS = minBatchBufferMS;
  if (predictiveBatchTiming && 4 * concurrentBatches > pool.length) {
    concurrentBatches = Math.floor(pool.length / 4);
    batchBufferMS = Math.ceil(batchMS / concurrentBatches);
    // ns.tprintf("Since I only have %d helpers (%d max concurrent batches), I have to set the inter-batch buffer to %dms", pool.length, concurrentBatches, batchBufferMS);
  }
  const tasks = [
    {
      "delayMS": batchMS - 4 * bufferMS - weakMS,
      "verb": "weaken",
      "target": target
    },
    {
      "delayMS": batchMS - 3 * bufferMS - growMS,
      "verb": "grow",
      "target": target
    },
    {
      "delayMS": batchMS - 2 * bufferMS - weakMS,
      "verb": "weaken",
      "target": target
    },
    {
      "delayMS": batchMS - bufferMS - hackMS,
      "verb": "hack",
      "target": target
    }
  ]
  // ns.tprintf("batch configured");

  await runBatch(ns, tasks);
  // ns.tprintf("  done, sleeping");
  await ns.sleep(batchBufferMS);
}

/** @param {NS} ns **/
async function runBatch(ns, tasks) {
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    // ns.tprintf("  running %s on %s after %dms", task.verb, task.target, task.delayMS);
    let written = false;
    while (!written) {
      written = await ns.tryWritePort(botPort, ["" + task.delayMS, task.verb, task.target].join(" "));
      if (!written) {
        if (toastOnPortFull) ns.toast(ns.sprintf("port %d full, waiting %dms", botPort, portFullWaitMS), "warning", portFullWaitMS);
        await ns.sleep(portFullWaitMS);
      }
    }
  }
}

/** @param {NS} ns **/
function targetPrepared(ns, target) {
  const serverMaxMoney = ns.getServerMaxMoney(target);
  const moneyThreshold = serverMaxMoney * 0.75;
  const minSecLevel = ns.getServerMinSecurityLevel(target);
  const securityThreshold = minSecLevel + 5;
  const currentSecLevel = ns.getServerSecurityLevel(target);
  const serverMoney = ns.getServerMoneyAvailable(target);

  // ns.tprintf("Current money is %s (max %s)", formatMoney(serverMoney), formatMoney(serverMaxMoney));
  // ns.tprintf("Security level is %d (min %d)", currentSecLevel, minSecLevel);

  return currentSecLevel <= securityThreshold && serverMoney >= moneyThreshold
}

function pad(num, len, char = "0") {
  let str = "" + num;
  while (str.length < len) str = char + str;
  return str;
}
