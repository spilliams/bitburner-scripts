// opens up the current host.
// scans the local network.
// for every connection on it, copies this script to it, runs it.

/** @param {NS} ns **/
export async function main(ns) {
  const test = "infected2.txt";
  if (ns.fileExists(test)) {
    return;
  }

  var host = ns.getHostname();

  if (host.substr(0, 5) == "pserv") {
    return;
  }
  if (host != "home") {
    openPorts(ns, host);
  }

  await scanLoop(ns, host);

  await ns.write(test, "lol");
}

// 
/** @param {NS} ns **/
async function scanLoop(ns, host) {
  let servers = ns.scan();
  let script = ns.getScriptName();
  for (let i = 0; i < servers.length; i++) {
    let target = servers[i];
    if (target.substr(0, 5) == "pserv") {
      continue;
    }

    openPorts(ns, target);
    await ns.nuke(target);

    await ns.scp(script, host, target);
    ns.exec(script, target)
    await ns.sleep(5000);
  }
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
