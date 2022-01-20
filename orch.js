import { getNumPortScriptsAvailable } from "target.js";
import { formatMoney } from "util_formatMoney.js";
import { scanAll } from "util_recurse.js";
import { breakIt, takeIt } from "infect.js";

// args: target

const helperPayload = "3.js";

const bufferMS = 100;

/** @param {NS} ns **/
export async function main(ns) {
  const helperPayloadRAM = ns.getScriptRam(helperPayload);

  // what are my helpers?
  // servers that run 3.js with an action at invoke-time, and they wait for jobs to come
  // from the comm port?
  // I also invoke them with a number of threads (unsure how this plays into the ratio/batches)
  // or maybe my pool right now is just "servers that have enough ram to run my script"
  // (also I need to be able to scp to them...)
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
    const threads = await takeIt(ns, host, helperPayload);
    if (threads > 0) {
      pool.push(host);
    }
  }
  ns.tprintf("%d servers in pool", pool.length);

  // 2.js is a good guide, but naive in that all the runners don't know about each other.
  // orch is meant to solve that shortsightedness.
  // if getServerSecurityLevel > getServerMinSecurityLevel+5, weaken & continue
  // if getServerMoneyAvailable < getServerMaxMoney*0.75, grow & continue
  // otherwise, hack

  // docs are helpful too
  // The effects of hack, grow, and weaken, are determined when the time is completed, rather
  // than at the beginning. Hack should finish when security is minimum and money is maximum.
  // Grow should finish when security is minimum, shortly after a hack occurred. Weaken should
  // occur when security is not at a minimum due to a hack or grow increasing it.
  // Step 1: Identify a target
  // Step 2: WG in batches to prepare the target for hacking. Once it's over both thresholds,
  // move to step 3.
  // Step 3: HWGW in batches, timed so the commands end in order.

  // open questions: can I determine "how much can I expect each batch to make?"? Because that
  // would help prioritize targets.
  // Does weakening with 100 threads go faster than weakening with 1 thread?
  // Will I be running multiple targets at once?

  // experiment time!
  const target = ns.args[0];
  // first, make sure I can hack it
  const numPortScripts = getNumPortScriptsAvailable(ns);
  const currentHackingSkill = ns.getHackingLevel();
  const server = ns.getServer(target);
  // TODO switch to these if they're less than the 2GB for getServer...
  const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
  const minSecLevel = ns.getServerMinSecurityLevel(target);
  const securityThreshold = minSecLevel + 5;
  const currentSecLevel = ns.getServerSecurityLevel(target);
  // const serverMoney = ns.getServerMoneyAvailable(target);

  if (server["requiredHackingSkill"] > currentHackingSkill) {
    ns.tprintf("You need hacking level %d to target %s", server["requiredHackingSkill"], target);
    return;
  }
  if (numPortScripts < server["numOpenPortsRequired"]) {
    ns.tprintf("You need %d port scripts in order to hack target %s", server["numOpenPortsRequired"], target);
    return;
  }

  ns.tprintf("Information on target '%s'", target);
  ns.tprintf("Current money is %s (max %s)", formatMoney(server["moneyAvailable"]), formatMoney(server["moneyMax"]));
  ns.tprintf("Difficulty is %d min, %d base, %d hack", server["minDifficulty"], server["baseDifficulty"], server["hackDifficulty"]);
  ns.tprintf("Security level is %d (min %d)", currentSecLevel, minSecLevel);
  ns.tprintf("Current growth is %d", server["serverGrowth"]);

  const growMS = ns.getGrowTime(target);
  const weakMS = ns.getWeakenTime(target);
  const hackMS = ns.getHackTime(target);
  const batchMS = Math.max(
    4 * bufferMS + hackMS,
    3 * bufferMS + weakMS,
    2 * bufferMS + growMS
  );
  let concurrentBatches = Math.ceil(batchMS / (4 * bufferMS));
  ns.tprintf("grow time is %dms", growMS);
  ns.tprintf("weaken time is %dms", weakMS);
  ns.tprintf("hack time is %dms", hackMS);
  ns.tprintf("batch time (HWGW) is %fs total, %dms hot (%f%% hot)", (batchMS / 1000.0).toFixed(3), (4 * bufferMS), (100 * (4 * bufferMS) / batchMS).toFixed(2));
  ns.tprintf("I will want to run %d batches at once (%d helpers)", concurrentBatches, 4 * concurrentBatches);
  let batchBufferMS = 0;
  if (4 * concurrentBatches > pool.length) {
    // ---------*
    //  ---------*
    //   ---------*
    //    ---------*
    //     ---------*
    //      ---------*
    //       ---------*
    //        ---------*
    //         ---------*
    //          ---------*
    // vs
    // ---------*--
    //    ---------*--
    //       ---------*--
    //          ---------*
    concurrentBatches = Math.floor(pool.length / 4);
    batchBufferMS = Math.ceil(batchMS / concurrentBatches);
    ns.tprintf("Since I only have %d helpers (%d max concurrent batches), I have to set the inter-batch buffer to %dms", pool.length, concurrentBatches, batchBufferMS);
  }

  if (currentSecLevel > securityThreshold) {
    ns.tprintf("Security Level is higher than threshold; I recommend `weaken`.");
    return;
  }
  if (server["moneyAvailable"] < moneyThreshold) {
    ns.tprintf("Server money is lower than threshold; I recommend `grow`.");
    return;
  }
  nt.tprintf("T1M3 7O H4CK");
}
