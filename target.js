// finds reasonable targets

/** @param {NS} ns **/
export async function main(ns) {
  // funnel: scanning, queued, vetted, reach

  // scanning targets are put in a list
  let scanning = ["home"];
  let scannedAll = false;

  // each scanning target is checked against the queued list
  // for a scanning target not in the queued list, that target
  // is added to the queued list, and that target is scanning
  // itself (with its scans added to the scanning list)
  while (!scannedAll) {
    const originalLength = scanning.length;
    let i = 0;
    while (i < originalLength) {
      const root = scanning[i];
      const leaves = ns.scan(root);
      for (let j = 0; j < leaves.length; j++) {
        const leaf = leaves[j]
        if (!scanning.includes(leaf)) {
          scanning.push(leaf);
        }
      }
      i++;
    }

    if (originalLength == scanning.length) {
      scannedAll = true;
      // } else {
      // 	ns.tprint("going around again");
      // 	ns.tprint(scanning);
    }
  }

  ns.tprintf("done! scanned %d servers", scanning.length);
  // ns.tprint(scanning);

  const portScriptsAvailable = getNumPortScriptsAvailable(ns);

  let hackable = [];
  let unhackable = [];
  // queued targets are run through in order, and vetted.
  // vetting means asking a host if it's hackable.
  // (do I have the skill, and the port scripts).
  // "reach" targets are not yet hackable.
  const currentHackingSkill = ns.getHackingLevel();
  for (let i = 0; i < scanning.length; i++) {
    const host = scanning[i];
    if (host == "home" || host.includes("pserv")) {
      continue;
    }
    const server = ns.getServer(host);
    const hackableSkill = server["requiredHackingSkill"] <= currentHackingSkill;
    const hackablePorts = portScriptsAvailable >= server["numOpenPortsRequired"];

    if (hackableSkill && hackablePorts) {
      hackable.push(server);
    } else {
      unhackable.push(server);
    }
  }

  // vetted targets are sorted by max money descending, and 10 are printed
  // (in case the operator has morals like "don't hack schools or hospitals")
  hackable = hackable.sort(cmpHackable);
  ns.tprintf("");
  const hQty = 5;
  ns.tprintf("Top %d hackable servers:", hQty);
  printServers(ns, hackable, hQty, printHackable);

  // reach targets are sorted by required hacking level ascending,
  // then required ports open ascending, and 5
  // are printed.
  unhackable = unhackable.sort(cmpUnhackable);
  ns.tprintf("");
  const uQty = 5;
  ns.tprintf("Top %d unhackable servers:", uQty);
  printServers(ns, unhackable, uQty, printUnhackable);
}

/** @param {NS} ns **/
function getNumPortScriptsAvailable(ns) {
  let sum = 0;
  if (ns.fileExists("BruteSSH.exe", "home")) {
    sum++;
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    sum++;
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    sum++;
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    sum++;
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
    sum++;
  }
  return sum;
}

function cmpHackable(a, b) {
  // negative if a < b
  // e.g., negative if they're in ascending order from a to b
  // positive if they're in ascending order from b to a
  return b["moneyMax"] - a["moneyMax"];
}

function cmpUnhackable(a, b) {
  if (a["requiredHackingSkill"] == b["requiredHackingSkill"]) {
    return a["numOpenPortsRequired"] - b["numOpenPortsRequired"];
  }

  return a["requiredHackingSkill"] - b["requiredHackingSkill"]
}

/** @param {NS} ns **/
function printServers(ns, list, qty, printFunc) {
  for (let i = 0; i < qty; i++) {
    printFunc(ns, list[i]);
  }
}

/** @param {NS} ns **/
function printHackable(ns, server) {
  ns.tprintf("    %s (%s): %s max money", server["organizationName"], server["hostname"], formatMoney(server["moneyMax"]));
}

/** @param {NS} ns **/
function printUnhackable(ns, server) {
  ns.tprintf("    %s (%s): needs %d skill, %d ports", server["organizationName"], server["hostname"], server["requiredHackingSkill"], server["numOpenPortsRequired"]);
}

/** @param {Number} dollars **/
function formatMoney(dollars) {
  const suffixes = ["", "k", "m", "b", "t", "q"];
  let suffix = 0;
  let left = dollars;
  while (left > 1000) {
    left /= 1000;
    suffix++;
  }
  return "$" + left.toFixed(3) + suffixes[suffix];
}
