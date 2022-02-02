/** @param {NS} ns **/
export async function main(ns) {
  while (ns.getServerMoneyAvailable("home") * .1 < 200000) {
    await ns.sleep(5000);
  }
  ns.purchaseTor();

  const portPrograms = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
  for (let i = 0; i < portPrograms.length; i++) {
    await purchase(ns, portPrograms[i]);
  }

  const utilPrograms = [
    "AutoLink.exe",
    // "Formulas.exe",
    "ServerProfiler.exe",
    "DeepscanV1.exe",
    "DeepscanV2.exe",
  ];
  for (let i = 0; i < utilPrograms.length; i++) {
    await purchase(ns, utilPrograms[i]);
  }
}

/** @param {NS} ns **/
async function purchase(ns, pgm) {
  let purchased = ns.fileExists(pgm, "home") || ns.purchaseProgram(pgm);
  while (!purchased) {
    await ns.sleep(30000);
    purchased = ns.fileExists(pgm, "home") || ns.purchaseProgram(pgm);
  }
  ns.tprintf("purchased %s", pgm);
}
