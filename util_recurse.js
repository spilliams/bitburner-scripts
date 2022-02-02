
/** @param {NS} ns **/
export async function main(ns) {
  ns.tprintf("This is a no-op on purpose: other scripts import this, so we don't want to bloat them.");
}

/** @param {NS} ns **/
/** @return A list of hostnames */
export function scanAll(ns) {
  ns.disableLog("scan");

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
    }
  }

  return scanning;
}
