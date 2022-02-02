import { getNumPortScriptsAvailable } from "target.js";
import { formatMoney, formatNow } from "util_format.js";
import { scanAll } from "util_recurse.js";
import { breakIt } from "infect.js";
import { pad } from "util_format.js";

// args:
// 1. target
// 2. (optional) make it toasty

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length === 0) {
    ns.tprintf("script requires at least 1 arg: the hostname of a target");
    return;
  }
  const target = ns.args[0];
  let settings = {
    "maxBotsPerHost": 1000
  };
  if (ns.args.length > 1) {
    settings["toasty"] = true;
    settings["helperPayloadAddlArgs"] = ["toasty"];
  }

  await orchestrate(ns, target, settings);
}

const defaultSettings = {
  "botPort": 1,
  "bufferMS": 500, // time between tasks in a batch
  "fillBotServer": false, // whether to maximize each bot server (run payload multi-threaded)
  "helperPayload": "4.js",
  "helperPayloadAddlArgs": [],
  "killRunningBots": false,
  "maxBotsPerHost": 32,
  "minBatchBufferMS": 100, // min time between batches
  "portFullWaitMS": 2000,
  "predictiveBatchTiming": false, // if off, just delay the minBatchBufferMS between batches
  "takeItWaitMS": 50, // time bw bot spinups (many bots per host)
  "toasty": false,
  "useHomeServer": false,
  "useOtherServers": true,
  "usePurchasedServers": false
}

/** @param {NS} ns **/
export async function orchestrate(ns, target, cfg = {}) {
  ns.disableLog("getServerMaxMoney");
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("sleep");
  ns.tail();

  const settings = { ...defaultSettings, ...cfg };

  // first, make sure I can hack it
  const valid = await targetValid(ns, target)
  if (!valid) return;

  // clear the queue, in case it's got old jobs in it
  ns.clearPort(settings.botPort);

  // build a pool of bots.
  // a bot is a single-threaded run of payload on a server
  let servers = [];
  if (settings.usePurchasedServers) servers = ns.getPurchasedServers();
  if (settings.useHomeServer) servers.push("home");
  if (settings.useOtherServers) {
    const purchased = ns.getPurchasedServers();
    const allServers = scanAll(ns);
    for (let i = 0; i < allServers.length; i++) {
      if (allServers[i] == "home") continue;
      if (purchased.includes(allServers[i])) continue;
      servers.push(allServers[i]);
    }
  }
  ns.tprintf("Scanned %d servers", servers.length);

  const numBots = await setupHelperPool(ns, servers, settings);
  ns.tprintf("%d bots in the pool", numBots);

  await prepareTarget(ns, target, numBots, settings);

  ns.tprintf("T1M3 7O H4CK");
  while (true) {
    await hackTarget(ns, target, numBots, settings);
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
async function setupHelperPool(ns, servers, settings) {
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

    let payloadArgs = [settings.botPort, host, ...settings.helperPayloadAddlArgs];
    let bots = await takeIt(ns, host, settings.helperPayload, settings, payloadArgs);
    ns.tprintf("started %d bots on %s (%d/%d)", bots, host, i + 1, servers.length);
    numBots += bots;
  }
  return numBots;
}

/** @param {NS} ns **/
/** @return Whether it executed the payload on the host **/
async function takeIt(ns, host, payload, settings, args = []) {
  if (settings.killRunningBots) {
    await ns.killall(host);
  }
  const availableRAM = ns.getServerMaxRam(host) - ns.getServerUsedRam(host); // 16 = 16 - 0
  const availableThreads = Math.floor(availableRAM / ns.getScriptRam(payload)); // 8 = 16 / 2
  const numBots = Math.min(availableThreads, settings.maxBotsPerHost); // min(8, )
  let threadsPerBot = Math.floor(availableThreads / numBots);
  if (!settings.fillBotServer) threadsPerBot = 1;
  const suffixLen = Math.ceil(Math.log10(numBots));
  for (let i = 0; i < numBots; i++) {
    await ns.scp(payload, "home", host);
    let newName = payload.split(".")[0] + "-" + pad(i, suffixLen, "0") + "." + payload.split(".")[1];
    ns.mv(host, payload, newName);
    ns.exec(newName, host, threadsPerBot, ...args);
    await ns.sleep(settings.takeItWaitMS);
  }

  return numBots;
}

/** @param {NS} ns **/
async function prepareTarget(ns, target, pool, settings) {
  ns.tprintf("Preparing target %s", target);

  const growMS = ns.getGrowTime(target);
  const weakMS = ns.getWeakenTime(target);
  const batchMS = Math.max(
    2 * settings.bufferMS + growMS,
    settings.bufferMS + weakMS
  );
  const hotMS = 2 * settings.bufferMS;
  let concurrentBatches = Math.ceil(batchMS / hotMS);
  ns.tprintf("grow time is %dms", growMS);
  ns.tprintf("weaken time is %dms", weakMS);
  ns.tprintf("batch time (GW) is %fs total, %dms hot (%f%% hot)", (batchMS / 1000.0).toFixed(3), hotMS, (100 * hotMS / batchMS).toFixed(2));
  ns.tprintf("I want to run %d batches at once (%d bots)", concurrentBatches, 2 * concurrentBatches);
  let batchBufferMS = settings.minBatchBufferMS;
  if (settings.predictiveBatchTiming && 2 * concurrentBatches > pool.length) {
    concurrentBatches = Math.floor(pool.length / 2);
    batchBufferMS = Math.ceil(batchMS / concurrentBatches);
    ns.tprintf("Since I only have %d bots (%d max concurrent batches), I have to set the inter-batch buffer to %dms", pool.length, concurrentBatches, batchBufferMS);
  }
  ns.tprintf("batch buffer: %dms", batchBufferMS);
  const tasks = [
    {
      "delayMS": batchMS - 2 * settings.bufferMS - growMS,
      "verb": "grow",
      "target": target
    },
    {
      "delayMS": batchMS - settings.bufferMS - weakMS,
      "verb": "weaken",
      "target": target
    }
  ]

  while (!targetPrepared(ns, target)) {
    await runBatch(ns, tasks, settings);
    // ns.tprintf("  done, sleeping for %dms", batchBufferMS);
    await ns.sleep(batchBufferMS);
  }
}

/** @param {NS} ns **/
async function hackTarget(ns, target, pool, settings) {
  const growMS = ns.getGrowTime(target);
  const weakMS = ns.getWeakenTime(target);
  const hackMS = ns.getHackTime(target);
  const batchMS = Math.max(
    4 * settings.bufferMS + weakMS,
    3 * settings.bufferMS + growMS,
    settings.bufferMS + hackMS
  );
  const hotMS = 4 * settings.bufferMS;
  let concurrentBatches = Math.ceil(batchMS / hotMS);
  // ns.tprintf("grow time is %dms", growMS);
  // ns.tprintf("weaken time is %dms", weakMS);
  // ns.tprintf("hack time is %dms", hackMS);
  // ns.tprintf("batch time (WGWH) is %fs total, %dms hot (%f%% hot)", (batchMS / 1000.0).toFixed(3), hotMS, (100 * hotMS / batchMS).toFixed(2));
  // ns.tprintf("I want to run %d batches at once (%d helpers)", concurrentBatches, 4 * concurrentBatches);
  let batchBufferMS = settings.minBatchBufferMS;
  if (settings.predictiveBatchTiming && 4 * concurrentBatches > pool.length) {
    concurrentBatches = Math.floor(pool.length / 4);
    batchBufferMS = Math.ceil(batchMS / concurrentBatches);
    // ns.tprintf("Since I only have %d helpers (%d max concurrent batches), I have to set the inter-batch buffer to %dms", pool.length, concurrentBatches, batchBufferMS);
  }
  const tasks = [
    {
      "delayMS": batchMS - 4 * settings.bufferMS - weakMS,
      "verb": "weaken",
      "target": target
    },
    {
      "delayMS": batchMS - 3 * settings.bufferMS - growMS,
      "verb": "grow",
      "target": target
    },
    {
      "delayMS": batchMS - 2 * settings.bufferMS - weakMS,
      "verb": "weaken",
      "target": target
    },
    {
      "delayMS": batchMS - settings.bufferMS - hackMS,
      "verb": "hack",
      "target": target
    }
  ]
  // ns.tprintf("batch configured");

  await runBatch(ns, tasks, settings);
  // ns.tprintf("  done, sleeping");
  await ns.sleep(batchBufferMS);
}

/** @param {NS} ns **/
async function runBatch(ns, tasks, settings) {
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    // ns.tprintf("  running %s on %s after %dms", task.verb, task.target, task.delayMS);
    let written = false;
    while (!written) {
      written = await ns.tryWritePort(settings.botPort, ["" + task.delayMS, task.verb, task.target].join(" "));
      if (!written) {
        const msg = ns.sprintf("%s: port %d full, waiting %dms", formatNow(), settings.botPort, settings.portFullWaitMS)
        if (settings.toasty) ns.toast(msg, "warning", settings.portFullWaitMS);
        // if (debug) ns.print(msg);
        await ns.sleep(settings.portFullWaitMS);
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
