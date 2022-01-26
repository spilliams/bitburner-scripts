/** @param {NS} ns **/
export async function main(ns) {
  const rs = ns.getRunningScript(ns.args[0], ns.args[1], ...ns.args.slice(2));
  // ns.tprintf("%v (%s)", rs, typeof rs);
  if (rs == null) {
    ns.tprintf("null response");
    return;
  }
  const keys = Object.keys(rs);
  for (let i = 0; i < keys.length; i++) {
    ns.tprintf("%s: %v", keys[i], rs[keys[i]]);
  }
}
