/** @param {NS} ns **/
export async function main(ns) {
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
      ns.tprintf(`"%s" -> "%s"`, sources[j], leaf);
    }
  }
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
    }
  }

  ns.tprintf("done! scanned %d servers", scanning.length);
  return reverseTree;
}
