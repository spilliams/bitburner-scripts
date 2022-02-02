/** @param {NS} ns **/
export async function main(ns) {
  ns.purchaseTor();
  // TODO purchaseTor returns false if we already bought it
  // while (!purchased) {
  //   await ns.sleep(30000);
  //   purchased = ns.purchaseTor();
  // }

  const portPrograms = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
  for (let i = 0; i < portPrograms.length; i++) {
    await purchase(ns, portPrograms[i]);
    // await resetPayload();
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
