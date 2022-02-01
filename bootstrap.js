/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("sleep");
  ns.disableLog("getHackingLevel");
  ns.tail();

  // run alias.js
  // run cmd.js

  await study(ns);
  // once hack is 10, start orchestration

  // start dark
  // start upbuy
  // TODO: start hacknet

  await writePrograms(ns);

  // every milestone (?) re-orchestrate. milestones are:
  // - enough hack level for a new target. Must be a significant new target?
  // - we bought a new port buster
}

/** @param {NS} ns **/
async function study(ns) {
  // TODO: calculate best course to take givne current hacknet income
  await ns.universityCourse("rothman university", "Study Computer Science", false);
}

/** @param {NS} ns **/
async function writePrograms(ns) {
  const programs = [
    // { "name": "AutoLink.exe", "hack": 25},
    { "name": "BruteSSH.exe", "hack": 50 },
    // { "name": "DeepscanV1.exe", "hack": 75},
    // { "name": "ServerProfiler.exe", "hack": 75},
    { "name": "FTPCrack.exe", "hack": 100 },
    { "name": "relaySMTP.exe", "hack": 250 },
    { "name": "HTTPWorm.exe", "hack": 500 },
    // { "name": "DeepscanV2.exe", "hack": 400},
    { "name": "SQLInject.exe", "hack": 750 }
  ];
  for (let i = 0; i < programs.length; i++) {
    const pgm = programs[i];
    if (ns.fileExists(pgm.name, "home")) continue;

    await study(ns);
    let printed = false;
    while (ns.getHackingLevel() < pgm.hack) {
      if (!printed) ns.print(ns.sprintf("studying to level %d before we can write %s", pgm.hack, pgm.name));
      printed = true;
      await ns.sleep(10000);
    }
    ns.createProgram(pgm.name, false);
    // as long as we're still working on it,
    // and as long as we haven't bought the program through Tor,
    // keep working.
    while (ns.isBusy() && !ns.fileExists(pgm.name, "home")) {
      await ns.sleep(10000);
    }

    // await reorchestrate(ns);
  }
}

/** @param {NS} ns **/
// async function reorchestrate(ns) {
//   ns.kill("orch.js");
//   ns.exec("")
// }
