/** @param {NS} ns **/
export async function main(ns) {
  let purchased = ns.purchaseTor();
  while (!purchased) {
    purchased = ns.purchaseTor();
  }

  const portPrograms = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
  for (let i = 0; i < portPrograms.length; i++) {
    await purchase(portPrograms[i]);
    await resetPayload();
  }

  const utilPrograms = ["ServerProfiler.exe", "DeepscanV1.exe", "DeepscanV2.exe", "AutoLink.exe", "Formulas.exe"];
  for (let i = 0; i < utilPrograms.length; i++) {
    await purchase(utilPrograms[i]);
  }
}

async function purchase(pgm) {
  let purchased = ns.purchaseProgram(pgm);
  while (!purchased) {
    await ns.sleep(30000);
    purchased = ns.purchaseProgram(pgm);
  }
}
