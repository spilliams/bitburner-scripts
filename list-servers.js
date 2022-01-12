// lists purchased servers, and their maximum RAM

/** @param {NS} ns **/
export async function main(ns) {
  let servers = ns.getPurchasedServers();
  for (let i = 0; i < servers.length; i++) {
    let ram = ns.getServerMaxRam(servers[i])
    ns.tprintf("%s: %dGB (%s to upgrade)", servers[i], ram, formatMoney(ns.getPurchasedServerCost(ram * 2)));
  }
}

/** @param {Number} dollars **/
function formatMoney(dollars) {
  const suffixes = ["", "k", "m", "b", "t", "q"];
  let suffix = 0;
  let left = dollars;
  while (left > 1000) {
    left /= 1000;
    suffix++;
  }
  return "$" + left.toFixed(3) + suffixes[suffix];
}
