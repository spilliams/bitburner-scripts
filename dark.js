/** @param {NS} ns **/
export async function main(ns) {
  let purchased = ns.purchaseTor();
  while (!purchased) {
    await ns.sleep(30000);
    purchased = ns.purchaseTor();
  }

  const portPrograms = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
  for (let i = 0; i < portPrograms.length; i++) {
    await purchase(portPrograms[i]);
    // await resetPayload();
  }

  const utilPrograms = ["ServerProfiler.exe", "DeepscanV1.exe", "DeepscanV2.exe", "AutoLink.exe", "Formulas.exe"];
  for (let i = 0; i < utilPrograms.length; i++) {
    await purchase(utilPrograms[i]);
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
