// args: starting integer (hostname pserv1-N), target

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length !== 2) {
    throw "2 args required: integer for hostname suffix and target hostname";
  }

  const ram = 8;
  let i = ns.args[0];

  // console.log("purchased server limit is ", ns.getPurchasedServerLimit());
  while (i < ns.getPurchasedServerLimit()) {
    let money = ns.getServerMoneyAvailable("home");
    let cost = ns.getPurchasedServerCost(ram);
    // console.log("money is ", money);
    // console.log("cost is  ", cost);
    if (money > cost) {
      var hostname = ns.purchaseServer("pserv1-" + i, ram);
      // console.log("purchased ", hostname),
      await ns.scp("1.js", hostname);
      ns.exec("1.js", hostname, 3, ns.args[1]);
      ++i;
    }
    await ns.sleep(1000);
  }
}
