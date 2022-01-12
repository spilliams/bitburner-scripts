/** @param {NS} ns **/
export async function main(ns) {
  let newArgs = ns.args.slice(1);
  ns.tprint(newArgs.length);
}
