/** @param {NS} ns **/
export async function main(ns) {
  const servers = scanAll(ns);
  ns.tprintf("Scanned %d servers", servers.length);
  // ns.tprint(servers);

  let contracts = [];

  for (let i = 0; i < servers.length; i++) {
    const host = servers[i];
    const files = ns.ls(host);
    if (files.length > 0) {
      ns.tprintf("%s:", host);
    }
    for (let j = 0; j < files.length; j++) {
      ns.tprintf("  %s", files[j]);
      if (files[j].endsWith(".cct")) {
        contracts.push(ns.sprintf("%s:%s", host, files[j]));
      }
    }
  }

  ns.tprintf("contracts:")
  for (let k = 0; k < contracts.length; k++) {
    ns.tprintf("  %s", contracts[k]);
  }
}

/** @param {NS} ns **/
/** @return A list of hostnames */
function scanAll(ns) {
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

  return scanning;
}
