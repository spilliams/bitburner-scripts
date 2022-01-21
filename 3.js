// (remember: this is a payload. no imports)

// weaken/grow/hack script
// args: action to take, target to hit

/** @param {NS} ns **/
export async function main(ns) {
  const action = ns.args[0];
  const target = ns.args[1];
  switch (action) {
    case "weaken":
      return await ns.weaken(target);
    case "grow":
      return await ns.grow(target);
    case "hack":
      return await ns.hack(target);
    default:
      throw "unrecognized action " + action;
  }
}
