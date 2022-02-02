/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("sleep");
  ns.disableLog("getHackingLevel");
  ns.tail();

  // run cmd.js

  await study(ns);
  while (ns.getHackingLevel() < 20) {
    await ns.sleep(1000);
  }
  await reorchestrate(ns);

  ns.exec("dark.js", "home")
  ns.exec("buy-upgrade.js", "home", 1, "4.js", 2);
  ns.exec("write-programs.js");
  ns.exec("backdoor.js");
  // TODO: start hacknet
  // TODO: start home-improvement

  // every milestone (?) re-orchestrate. milestones are:
  // - enough hack level for a new target. Must be a significant new target?
  // - we have a new port buster (bought or made)
}

/** @param {NS} ns **/
async function study(ns) {
  // TODO: calculate best course to take given current passive income
  await ns.universityCourse("rothman university", "Study Computer Science", false);
}

/** @param {NS} ns **/
async function reorchestrate(ns) {
  // ns.kill("orch.js");
  // ns.exec("orch.js", "home", 1, oTarget);
  // ns.kill("porch.js");
  // ns.exec("porch.js", "home", 1, pTarget);
}
