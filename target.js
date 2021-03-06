import { scanAll } from "util_recurse.js";
import { formatMoney } from "util_format.js";

// finds reasonable targets

/** @param {NS} ns **/
export async function main(ns) {
  const targets = topTargets(ns);

  ns.tprintf("");
  const hQty = 5;
  ns.tprintf("Top %d hackable servers:", hQty);
  printServers(ns, targets.hackable, hQty, printHackable);

  ns.tprintf("");
  const uQty = 5;
  ns.tprintf("Top %d unhackable servers:", uQty);
  printServers(ns, targets.unhackable, uQty, printUnhackable);
}

/** @param {NS} ns **/
export function topTargets(ns) {
  // funnel: scanning, queued, vetted, reach
  const scanning = scanAll(ns);

  ns.tprintf("done! scanned %d servers", scanning.length);
  // ns.tprint(scanning);

  const portScriptsAvailable = getNumPortScriptsAvailable(ns);

  let hackable = [];
  let unhackable = [];
  // queued targets are run through in order, and vetted.
  // vetting means asking a host if it's hackable.
  // (do I have the skill, and the port scripts).
  const currentHackingSkill = ns.getHackingLevel();
  for (let i = 0; i < scanning.length; i++) {
    const host = scanning[i];
    const server = ns.getServer(host);
    if (host == "home" || server["purchasedByPlayer"]) {
      continue;
    }
    const hackableSkill = server["requiredHackingSkill"] <= currentHackingSkill;
    const hackablePorts = portScriptsAvailable >= server["numOpenPortsRequired"];

    if (hackableSkill && hackablePorts) {
      hackable.push(server);
    } else {
      unhackable.push(server);
    }
  }

  hackable = hackable.sort(cmpHackable);
  unhackable = unhackable.sort(cmpUnhackable);

  return { "hackable": hackable, "unhackable": unhackable };
}

/** @param {NS} ns **/
export function getNumPortScriptsAvailable(ns) {
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

// hackable targets are sorted by max money descending
function cmpHackable(a, b) {
  // negative if a < b
  // e.g., negative if they're in ascending order from a to b
  // positive if they're in ascending order from b to a
  return b["moneyMax"] - a["moneyMax"];
}

// unhackable targets are sorted by required hacking level ascending,
// then required ports open ascending
function cmpUnhackable(a, b) {
  if (a["requiredHackingSkill"] == b["requiredHackingSkill"]) {
    return a["numOpenPortsRequired"] - b["numOpenPortsRequired"];
  }

  return a["requiredHackingSkill"] - b["requiredHackingSkill"]
}

/** @param {NS} ns **/
function printServers(ns, list, qty, printFunc) {
  qty = Math.min(qty, list.length);
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
