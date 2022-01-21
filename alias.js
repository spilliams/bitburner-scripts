/** @param {NS} ns **/
export async function main(ns) {
  const linkMap = buildMap(ns);
  const leaves = Object.keys(linkMap);
  leaves.sort();
  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i];
    const connects = linkMap[leaf];
    let name = leaf.split("-").join("_");
    name = name.split(".").join("dot");
    ns.tprintf("alias goto_%s=\"%s\";", name, connects);
  }
}

/** @param {NS} ns **/
function buildMap(ns) {

  let scanning = ["home"];
  let scannedAll = false;
  let linkMap = {};

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
        const mapped = Object.keys(linkMap)
        if (!mapped.includes(leaf)) {
          if (!mapped.includes(root)) {
            linkMap[leaf] = "connect " + leaf;
          } else {
            linkMap[leaf] = linkMap[root] + "; connect " + leaf;
          }
        }
      }
      i++;
    }

    if (originalLength == scanning.length) {
      scannedAll = true;
    }
  }

  ns.tprintf("done! scanned %d servers", scanning.length);
  return linkMap;
}
