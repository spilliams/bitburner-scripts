import { scanAll } from "util_recurse.js";

// opens up the current host.
// scans the local network.
// for every connection on it, copies this script to it, runs it.

// if we find a server with stuff running on it that isn't the script we want, kill all that stuff
const killAllRunning = false;

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length < 1) {
    ns.tprintf("requires at least 1 arg: payload. subsequent args are passed to the payload");
    return;
  }
  const payload = ns.args[0];
  const args = ns.args.slice(1);

  const servers = scanAll(ns);
  ns.tprintf("Scanned %d servers", servers.length);
  // ns.tprint(scanning);

  let sumTargets = 0;
  let sumThreads = 0;
  for (let i = 0; i < servers.length; i++) {
    const host = servers[i];
    if (host == "home") {
      continue;
    }
    let broken = await breakIt(ns, host);
    if (!broken) {
      continue;
    }
    sumTargets++;

    await cleanIt(ns, host, payload, args);

    sumThreads += await takeIt(ns, host, payload, args);
  }
  ns.tprintf("Started %d threads on %d servers", sumThreads, sumTargets);
}

/** @param {NS} ns **/
export async function breakIt(ns, target) {
  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(target);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(target);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(target);
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    ns.httpworm(target);
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
    ns.sqlinject(target);
  }

  try {
    await ns.nuke(target);
  } catch {
    return false;
  }
  return true;
}

/** @param {NS} ns **/
async function cleanIt(ns, host, payload, args = []) {
  const rs = ns.getRunningScript(payload, host, ...args);
  // if there is a running script with these args, leave it alone
  if (rs !== null) {
    return;
  }
  // otherwise, there might be a running script with other args, so kill all
  if (killAllRunning) {
    await ns.killall(host);
  }
}

/** @param {NS} ns **/
/** @return The number of threads started on the target **/
export async function takeIt(ns, host, payload, args = []) {
  const max = ns.getServerMaxRam(host);
  const used = ns.getServerUsedRam(host);
  const avail = max - used;
  const threads = ((avail / ns.getScriptRam(payload)) * 10) / 10;
  if (threads < 1) {
    return 0;
  }
  await ns.scp(payload, "home", host);
  ns.exec(payload, host, threads, ...args);
  return threads;
}
