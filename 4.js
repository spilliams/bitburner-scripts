// (remember: this is a payload. no imports)

// weaken/grow/hack script
// args: port to listen to

/** @param {NS} ns **/
export async function main(ns) {
  const port = ns.args[0];

  while (true) {
    const job = ns.readPort(port);
    if (job != "NULL PORT DATA") {
      await action(ns, job);
    }
    await ns.sleep(1000);
  }
}

async function action(ns, job) {
  const parts = job.split(" ");
  const delayMS = parseInt(parts[0]);
  const verb = parts[1];
  const target = parts[2];
  await ns.sleep(delayMS);
  switch (verb) {
    case "weaken":
      await ns.weaken(target);
      break;
    case "grow":
      await ns.grow(target);
      break;
    case "hack":
      await ns.hack(target);
      break;
    default:
      throw "unrecognized action " + verb;
  }
  ns.toast("%s %s complete", verb, target);
}
