/** @param {NS} ns **/
export async function main(ns) {
  let scriptToKill = "all";
  if (ns.args.length == 1) {
    scriptToKill = ns.args[0];
  }

  if (scriptToKill === "all" && ns.killall("home")) {
    ns.tprintf("killed all on home");
  } else if (ns.scriptKill(ns.args[0], "home")) {
    ns.tprintf("killed %s on home", ns.args[0]);
  }
}
