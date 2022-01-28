import { orchestrate } from "orch.js";
/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length === 0) {
    ns.tprintf("script requires at least 1 arg: the hostname of a target");
    return;
  }
  const target = ns.args[0];

  let settings = {
    "botPort": 3,
    "maxBotsPerHost": 32,
    "useHomeServer": true,
    "useOtherServers": false,
    "usePurchasedServers": false
  };
  if (ns.args.length > 1) {
    settings["toasty"] = true;
    settings["helperPayloadAddlArgs"] = ["toasty"];
  }

  await orchestrate(ns, target, settings);
}
