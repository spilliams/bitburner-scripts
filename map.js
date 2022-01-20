/** @param {NS} ns **/
export async function main(ns) {
  // if (ns.args.length != 1) {
  //     ns.tprint("requires 1 arg: hostname to trace");
  //     return;
  // }

  // const needle = ns.args[0];
  const reverseTree = buildTree(ns);
  const leaves = Object.keys(reverseTree);
  leaves.sort();
  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i];
    const sources = reverseTree[leaf];

    // compact
    // ns.tprintf("%s: [%s]", leaf, sources.join(", "));

    // graphviz
    for (let j = 0; j < sources.length; j++) {
      if (sources[j].includes("pserv") || leaf.includes("pserv")) continue;
      ns.tprintf(`"%s" -> "%s"`, sources[j], leaf);
    }
  }

  // const trace = [needle];

  // let last = trace[trace.length-1];
  // let limit = 20;
  // while (limit > 0 && last != "home") {
  // 	trace.push[reverseTree[last][0]];
  // 	last = trace[trace.length-1];
  // 	limit--;
  // }

  // trace.reverse();

  // ns.tprintf("%s", trace.join(" -> "));
}

/** @param {NS} ns **/
function buildTree(ns) {

  let scanning = ["home"];
  let scannedAll = false;
  let reverseTree = {};

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
        if (typeof reverseTree[leaf] == "undefined") {
          reverseTree[leaf] = [];
        }
        if (!reverseTree[leaf].includes(root)) {
          reverseTree[leaf].push(root);
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
  return reverseTree;
}
