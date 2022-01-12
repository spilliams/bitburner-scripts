// opens up the current host.
// scans the local network.
// for every connection on it, copies this script to it, runs it.

/** @param {NS} ns **/
export async function main(ns) {
  // const testFile = "zinfect_"+Date.now()+".txt";
  const testFile = "zinfect23.txt";

  if (ns.args.length < 1) {
    ns.tprint("requires at least 1 arg: payload script. subsequent args get passed to payload script.");
    return;
  }
  const script = ns.args[0];
  const scriptArgs = ns.args.slice(1, ns.args.length);
  let host = ns.getHostname();

  if (ns.fileExists(testFile)) {
    // ns.tprintf("file %s exists on %s, so exiting", testFile, host);
    return;
  }

  if (host.substr(0, 5) == "pserv") {
    // ns.tprintf("host is a pserv (%s), so exiting", host)
    return;
  }

  await scanLoop(ns, host, script);

  if (host != "home") {
    await runLoop(ns, host, script, scriptArgs);
  }

  await ns.write(testFile, "lol");
}

/** @param {NS} ns **/
async function scanLoop(ns, host, payload) {
  let servers = ns.scan();
  let script = ns.getScriptName();
  for (let i = 0; i < servers.length; i++) {
    await ns.sleep(3000);
    let target = servers[i];
    if (target == "home" || target.substr(0, 5) == "pserv") {
      continue;
    }

    openPorts(ns, target);
    try {
      await ns.nuke(target);
    } catch {
      continue;
    }

    await ns.scp(script, host, target);
    await ns.scp(payload, host, target);
    ns.killall(target);
    try {
      ns.exec(script, target, 1, ...ns.args);
    } catch {
      continue;
    }
  }
}

/** @param {NS} ns **/
async function runLoop(ns, host, script, scriptArgs) {
  const max = ns.getServerMaxRam(host);
  const used = ns.getServerUsedRam(host);
  const avail = max - used;
  const threads = ((avail / ns.getScriptRam(script)) * 10) / 10;
  ns.exec(script, host, threads, ...scriptArgs);
}

/** @param {NS} ns **/
function openPorts(ns, target) {
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
}
