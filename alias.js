/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length > 0) return await goto(ns, ns.args[0]);

  const linkMap = await buildMap(ns);
  const keys = Object.keys(linkMap);
  for (let i = 0; i < keys.length; i++) {
    const host = keys[i];
    const path = linkMap[host];
    ns.tprintf("%s: %s", host, path.join(" > "));
  }
}

/** @param {NS} ns **/
export async function goto(ns, hostname) {
  const linkMap = await buildMap(ns);
  if (typeof linkMap[hostname] == "undefined") throw ns.sprintf("can't go to %s: it's not in my link map. Typo?", hostname);

  const path = linkMap[hostname];
  for (let i = 0; i < path.length; i++) {
    if (ns.connect(path[i])) {
      ns.tprintf("Connected to %s", path[i]);
    } else {
      throw ns.sprintf("can't connect to %s (path %s)", path[i], path.join(" > "));
    }
  }
}

async function printAllAliases(ns) {
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
            linkMap[leaf] = ["home", leaf];
          } else {
            linkMap[leaf] = [...linkMap[root], leaf];
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
