// (remember: this is a payload. no imports)

// weaken/grow/hack script
// args:
// 1. port to listen to
// 2. a string to identify me (e.g. my own hostname)
// 3. (optional) make it toasty

const toastMS = 800;

/** @param {NS} ns **/
export async function main(ns) {
  const port = ns.args[0];
  const id = ns.args[1];
  let toasty = false;
  if (ns.args.length > 2) toasty = true;

  while (true) {
    const job = ns.readPort(port);
    if (job !== "NULL PORT DATA") {
      if (toasty) ns.toast(ns.sprintf("%s: %s", id, job), "info", toastMS);

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

      if (toasty) ns.toast(ns.sprintf("%s: %s complete on %s", id, verb, target), "success", toastMS);
    }
    await ns.sleep(1000);
  }
}
