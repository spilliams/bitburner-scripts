// (remember: this is a payload. no imports)

// weaken/grow/hack script
// args: port to listen to, a string to identify me (e.g. my own hostname)

/** @param {NS} ns **/
export async function main(ns) {
  const port = ns.args[0];
  const id = ns.args[1];

  while (true) {
    const job = ns.readPort(port);
    if (job !== "NULL PORT DATA") {
      // ns.toast(ns.sprintf("%s: %s", id, job), "info");

      const parts = job.split(" ");
      await ns.sleep(parseInt(parts[0]));
      const verb = parts[1];
      const target = parts[2];

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

      // ns.toast(ns.sprintf("%s: %s complete on %s", id, verb, target), "success");
    }
    await ns.sleep(1000);
  }
}
