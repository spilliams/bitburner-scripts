// if you don't yet have max servers, it spins up
// new 4gb servers.
// after that, it constantly loops over your purchased servers,
// and doubles their ram if you can afford it.

// args: payload, target

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length != 2) {
    ns.tprint("requires 2 args: payload and target");
    return;
  }
  const payload = ns.args[0];
  const target = ns.args[1];
  const limit = ns.getPurchasedServerLimit();
  let i = ns.getPurchasedServers().length;
  while (i < limit) {
    await buyServer(ns, "pserv4-" + i, payload, target);
    i++;
  }

  let servers = ns.getPurchasedServers();

  let j = 0;
  while (true) {
    await upgradeServer(ns, servers[j], payload, target);
    j = (j + 1) % servers.length;
  }
}

/** @param {NS} ns **/
async function buyServer(ns, hostname, payload, target) {
  const ram = 4;

  let money = ns.getServerMoneyAvailable("home");
  let cost = ns.getPurchasedServerCost(ram);

  while (money < cost) {
    await ns.sleep(10000);
    money = ns.getServerMoneyAvailable("home");
    cost = ns.getPurchasedServerCost(ram);
  }

  hostname = ns.purchaseServer(hostname, ram);
  const threads = ((ram / ns.getScriptRam(payload)) * 10) / 10;
  ns.tprintf("scping %s from home to %s", payload, hostname);
  await ns.scp(payload, "home", hostname);
  ns.exec(payload, hostname, threads, target);
}

/** @param {NS} ns **/
async function upgradeServer(ns, hostname, payload, target) {
  let currentRAM = ns.getServerMaxRam(hostname);
  let newRAM = currentRAM * 2;
  let cost = ns.getPurchasedServerCost(newRAM);
  while (ns.getServerMoneyAvailable("home") < cost) {
    await ns.sleep(30000);
  }
  ns.killall(hostname);
  ns.deleteServer(hostname);
  ns.purchaseServer(hostname, newRAM);

  await ns.scp(payload, hostname);
  let threads = ((newRAM / ns.getScriptRam(payload)) * 10) / 10;
  ns.exec(payload, hostname, threads, target);
}
