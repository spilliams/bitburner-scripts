/** @param {NS} ns **/
export async function main(ns) {
  await ns.writePort(ns.args[0], ns.args[1]);
}
