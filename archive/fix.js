// loops over your purchased servers,
// kills the existing processes
// and starting a new process using maximum threads.

// args: new script, new target 
// eg: run fix.js 1.js n00dles

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length != 2) {
    ns.tprintf("requires 2 args: payload and target");
    return;
  }

  let servers = ns.getPurchasedServers();
  for (let i = 0; i < servers.length; i++) {
    let host = servers[i];
    await rerun(ns, host)
  }
}

/** @param {NS} ns **/
/** @param {string} host **/
async function rerun(ns, host) {
  let ram = ns.getServerMaxRam(host);
  ns.killall(host);
  let script = ns.args[0];
  await ns.scp(script, host);
  let threads = ((ram / ns.getScriptRam(script)) * 10) / 10;
  ns.exec(script, host, threads, ns.args[1]);
  ns.tprintf("fixed script on %s", host);
}
