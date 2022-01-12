/** @param {NS} ns **/
export async function main(ns) {
  const baseURL = "https://raw.githubusercontent.com/spilliams/bitburner-scripts/main";
  const files = [
    "contracts/algorithmicStockTrader.js",
    "contracts/subarrayWithmaximumSum.js",
    "contracts/totalWaysToSum.js",
    "notes/bootstrap.txt",
    "util/formatMoney.js",
    "util/git-sync.js",
    "util/recurse.js",
    "2.js",
    "backdoor.js",
    "buy-upgrade.js",
    "contracts.js",
    "dark.js",
    "fix.js",
    "hostname.js",
    "infect.js",
    "kill.js",
    "list-servers.js",
    "ls-all.js",
    "map.js",
    "open.js",
    "target.js",
    "test.js"
  ];
  for (let i = 0; i < files.length; i++) {
    const got = await ns.wget(ns.sprintf("%s/%s", baseURL, files[i]), files[i]);
    if (got) {
      ns.tprintf("sync'd %s", files[i]);
    } else {
      ns.tprintf("FAILED to sync %s", files[i]);
    }
  }
}
