import { formatMoney } from "util_format.js";
import { getNumPortScriptsAvailable } from "target.js";
import { pad } from "util_format.js";

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length !== 1) {
    ns.tprintf("this script requires exactly 1 arg: hostname");
    return;
  }
  const target = ns.args[0];

  const currentHackingSkill = ns.getHackingLevel();
  const serverMaxMoney = ns.getServerMaxMoney(target);
  const minSecLevel = ns.getServerMinSecurityLevel(target);
  const currentSecLevel = ns.getServerSecurityLevel(target);
  const serverMoney = ns.getServerMoneyAvailable(target);
  const requiredHackingSkill = ns.getServerRequiredHackingLevel(target);
  const growthRate = ns.getServerGrowth(target);
  const growMS = Math.round(ns.getGrowTime(target)) / 1000.0;
  const weakMS = Math.round(ns.getWeakenTime(target)) / 1000.0;
  const hackMS = Math.round(ns.getHackTime(target)) / 1000.0;

  ns.tprintf("Current money is %s (max %s)", formatMoney(serverMoney), formatMoney(serverMaxMoney));
  ns.tprintf("Security level is %d (min %d)", currentSecLevel, minSecLevel);

  if (currentHackingSkill < requiredHackingSkill) {
    ns.tprintf("cannot hack target %s: need hack level %d", target, requiredHackingSkill);
  }
  const numPortScripts = getNumPortScriptsAvailable(ns);
  const requiredPortsOpen = ns.getServerNumPortsRequired(target);
  if (numPortScripts < requiredPortsOpen) {
    ns.tprintf("cannot hack target %s: need %d port scripts", target, requiredPortsOpen);
  }

  ns.tprintf("server growth is %d", growthRate);

  const maxTimeLength = ("" + Math.max(growMS, weakMS, hackMS)).length;
  ns.tprintf("grow time is   %sms", pad(growMS, maxTimeLength));
  ns.tprintf("weaken time is %sms", pad(weakMS, maxTimeLength));
  ns.tprintf("hack time is   %sms", pad(hackMS, maxTimeLength));
}
