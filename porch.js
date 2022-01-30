import { orchestrate } from "orch.js";
/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length === 0) {
    ns.tprintf("script requires at least 1 arg: the hostname of a target");
    return;
  }
  const target = ns.args[0];

  let settings = {
    "botPort": 2,
    "fillBotServer": true, // whether to maximize each bot server (run payload multi-threaded)
    "maxBotsPerHost": 64,
    "minBatchBufferMS": 5000,
    "predictiveBatchTiming": true,
    "useHomeServer": false,
    "useOtherServers": false,
    "usePurchasedServers": true
  };
  if (ns.args.length > 1) {
    settings["toasty"] = true;
    settings["helperPayloadAddlArgs"] = ["toasty"];
  }

  await orchestrate(ns, target, settings);
}
