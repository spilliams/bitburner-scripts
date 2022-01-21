import { getNumPortScriptsAvailable } from "target.js";
import { formatMoney } from "util_formatMoney.js";
import { scanAll } from "util_recurse.js";
import { breakIt } from "infect.js";

// args: target

const helperPayload = "4.js";
const bufferMS = 500;
const portToUse = 1;

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

  // helpers are servers that run the payload, waiting for instructions from the portToUse
  const pool = await setupHelperPool(ns);
  ns.tprintf("%d servers in the pool", pool.length);

  await prepareTarget(ns, target, pool);

  while (true) {
    await hackTarget(ns, target, pool);
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
async function setupHelperPool(ns) {
  const servers = scanAll(ns);
  let pool = [];
  ns.tprintf("Scanned %d servers", servers.length);
  for (let i = 0; i < servers.length; i++) {
    const host = servers[i];
    if (host == "home") {
      continue;
    }
    const broken = await breakIt(ns, host);
    if (!broken) {
      continue;
    }

    const started = await takeIt(ns, host, helperPayload, [portToUse]);
    if (started) {
      pool.push(host);
    }
  }
  return pool;
}

// Executes a payload on a host, if it has enough memory to.
/** @param {NS} ns **/
/** @return Whether it executed the payload on the host **/
async function takeIt(ns, host, payload, args = []) {
  await ns.killall(host);
  const max = ns.getServerMaxRam(host);
  const used = ns.getServerUsedRam(host);
  const avail = max - used;
  const threads = ((avail / ns.getScriptRam(payload)) * 10) / 10;
  if (threads < 1) {
    return false;
  }
  await ns.scp(payload, "home", host);
  // we want it to be 1 thread because more might make the timing all wonky?
  ns.exec(payload, host, 1, ...args);
  return true;
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
  ns.tprintf("I want to run %d batches at once (%d helpers)", concurrentBatches, 2 * concurrentBatches);
  let batchBufferMS = 0;
  if (2 * concurrentBatches > pool.length) {
    concurrentBatches = Math.floor(pool.length / 2);
    batchBufferMS = Math.ceil(batchMS / concurrentBatches);
    ns.tprintf("Since I only have %d helpers (%d max concurrent batches), I have to set the inter-batch buffer to %dms", pool.length, concurrentBatches, batchBufferMS);
  }
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
  ns.tprintf("batch configured");

  while (!targetPrepared(ns, target)) {
    await runBatch(ns, tasks);
    ns.tprintf("  done, sleeping");
    await ns.sleep(batchBufferMS);
  }
}

/** @param {NS} ns **/
async function hackTarget(ns, target, pool) {
  ns.tprintf("T1M3 7O H4CK");

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
  ns.tprintf("grow time is %dms", growMS);
  ns.tprintf("weaken time is %dms", weakMS);
  ns.tprintf("hack time is %dms", hackMS);
  ns.tprintf("batch time (WGWH) is %fs total, %dms hot (%f%% hot)", (batchMS / 1000.0).toFixed(3), hotMS, (100 * hotMS / batchMS).toFixed(2));
  ns.tprintf("I want to run %d batches at once (%d helpers)", concurrentBatches, 4 * concurrentBatches);
  let batchBufferMS = 0;
  if (4 * concurrentBatches > pool.length) {
    concurrentBatches = Math.floor(pool.length / 4);
    batchBufferMS = Math.ceil(batchMS / concurrentBatches);
    ns.tprintf("Since I only have %d helpers (%d max concurrent batches), I have to set the inter-batch buffer to %dms", pool.length, concurrentBatches, batchBufferMS);
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
  ns.tprintf("batch configured");

  await runBatch(ns, tasks);
  ns.tprintf("  done, sleeping");
  await ns.sleep(batchBufferMS);
}

/** @param {NS} ns **/
async function runBatch(ns, tasks) {
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    ns.tprintf("  running %s on %s after %dms", task.verb, task.target, task.delayMS);
    await ns.writePort(portToUse, ["" + task.delayMS, task.verb, task.target].join(" "));
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

  ns.tprintf("Current money is %s (max %s)", formatMoney(serverMoney), formatMoney(serverMaxMoney));
  ns.tprintf("Security level is %d (min %d)", currentSecLevel, minSecLevel);

  return currentSecLevel <= securityThreshold && serverMoney >= moneyThreshold
}
