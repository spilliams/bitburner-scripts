// opens up the current host.
// scans the local network.
// for every connection on it, copies this script to it, runs it.

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length != 1) {
    ns.tprint("requires 1 arg: script to kill");
    return;
  }

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

  for (let i = 0; i < scanning.length; i++) {
    const host = scanning[i];
    if (ns.scriptKill(ns.args[0], host)) {
      ns.tprintf("killed %s on %s", ns.args[0], host);
      // } else {
      // 	ns.tprint(ns.ps(host));
    }
  }
}
