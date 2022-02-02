import { getNumPortScriptsAvailable, topTargets } from "target.js";

const tickLengthMS = 30000;

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("disableLog");
  ns.disableLog("sleep");
  ns.disableLog("getHackingLevel");
  ns.tail();

  // run cmd.js

  await study(ns);
  while (ns.getHackingLevel() < 20) {
    await ns.sleep(1000);
  }
  reorchestrate(ns);
  let lastReorchHack = ns.getHackingLevel();

  // TODO: we can't start ALL these on a brand new instance.
  // How big is home when we start brand new?
  // Which are most important to be able to afford home-improvements?

  ns.exec("dark.js", "home"); // 5.80 GB 
  ns.exec("buy-upgrade.js", "home", 1, "4.js", 2); // 11.35 GB
  ns.exec("write-programs.js", "home"); // 9.35 GB
  // backdoor uses Connect, which may hinder other scripts that use Connect, or
  // manually-invoked commands.
  ns.exec("backdoor.js", "home"); // 6.5 GB
  // TODO: start hacknet
  // TODO: start home-improvement
  // orch.js and porch.js are each 7.85 GB

  // let priorHackLevel = ns.getHackingLevel();
  let priorNumPortBusters = getNumPortScriptsAvailable(ns);
  let priorTargets = topTargets(ns);
  while (true) {
    // let hackLevel = ns.getHackingLevel();
    let numPortBusters = getNumPortScriptsAvailable(ns);
    let targets = topTargets(ns);

    let milestone = false;
    // every milestone re-orchestrate. milestones are:
    // - enough hack level for a new target.
    if (targets.hackable.length > priorTargets.hackable.legth) milestone = true;
    // - we have a new port buster (bought or made)
    if (numPortBusters > priorNumPortBusters) milestone = true;
    if (milestone) reorchestrate(ns);

    // also, every tick check for
    // - new contracts available to solve
    // - new faction invites?
    // - home server is upgraded? run new programs

    // priorHackLevel = hackLevel;
    priorNumPortBusters = numPortBusters;
    priorTargets = targets;

    await ns.sleep(tickLengthMS);
  }
}

/** @param {NS} ns **/
async function study(ns, force = false) {
  if (ns.isBusy() && !force) return;
  // TODO: calculate best course to take given current passive income
  await ns.universityCourse("rothman university", "Study Computer Science", false);
}

/** @param {NS} ns **/
function reorchestrate(ns) {
  const targets = topTargets(ns);

  if (targets.hackable.length == 0) {
    ns.print("failed to reorchestrate: no targets are hackable");
    return;
  }

  // TODO: now we compare which is the better pool: purchased servers or infected
  // purchased servers we just need a size from
  // infected servers are trickier: it involves the number of port busters and
  // maybe the hack skill we have?
  // actually no, just count up all running scripts on these servers!

  // naive approach for now
  ns.scriptKill("orch.js", "home");
  ns.exec("orch.js", "home", 1, targets.hackable[0].hostname);

  if (targets.hackable.length == 1) return;

  ns.scriptKill("porch.js", "home");
  ns.exec("porch.js", "home", 1, targets.hackable[1].hostname);
}
