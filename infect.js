// opens up the current host.
// scans the local network.
// for every connection on it, copies this script to it, runs it.

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
    sumThreads += await takeIt(ns, host, payload, args);
  }
  ns.tprintf("Started %d threads on %d servers", sumThreads, sumTargets);
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
async function breakIt(ns, target) {
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
/** @return The number of threads started on the target **/
async function takeIt(ns, host, payload, args) {
  await ns.killall(host);
  const max = ns.getServerMaxRam(host);
  const used = ns.getServerUsedRam(host);
  const avail = max - used;
  const threads = ((avail / ns.getScriptRam(payload)) * 10) / 10;
  if (threads < 1) {
    return threads;
  }
  await ns.scp(payload, "home", host);
  ns.exec(payload, host, threads, ...args);
  return threads;
}
