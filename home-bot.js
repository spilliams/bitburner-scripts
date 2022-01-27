const slushGB = 128;
const payload = "4.js";

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length == 0) {
    ns.tprintf("This script requires at least one arg: the number of threads to run each bot with. Subsequent args will be passed to the payload");
    return;
  }

  const startIndex = 2928;

  // first arg is how many threads to run the payload with
  const numThreadsPerBot = parseInt(ns.args[0]);
  // subsequent args are passed to payload

  const maxRAM = ns.getServerMaxRam("home");
  const usedRAM = ns.getServerUsedRam("home");
  const availRAM = maxRAM - usedRAM - slushGB;
  ns.tprintf("%dGB max - %dGB used - %dGB slush = %dGB available", maxRAM, usedRAM, slushGB, availRAM);
  const scriptRAM = ns.getScriptRam(payload, "home");
  const numThreads = Math.floor(availRAM / scriptRAM);
  ns.tprintf("floor( %dGB available / %dGB payload ) = %d threads", availRAM, scriptRAM, numThreads);
  let numBots = Math.floor(numThreads / numThreadsPerBot);
  ns.tprintf("floor( %d threads / %d threads per bot ) = %d bots", numThreads, numThreadsPerBot, numBots);
  numBots = 490;
  const suffixLen = Math.ceil(Math.log10(startIndex + numBots));
  for (let i = 0; i < numBots; i++) {
    let name = ns.sprintf("4-%s.js", pad(i + startIndex, suffixLen, "0"));
    ns.tprintf("cp %s %s; run %s -t %d %v;", payload, name, name, numThreadsPerBot, ns.args.slice(1));
    // ns.exec(name, "home", parseInt(ns.args[0]), ...ns.args.slice(1));
  }
}

function pad(num, len, char = " ") {
  let str = "" + num;
  while (str.length < len) str = char + str;
  return str;
}
