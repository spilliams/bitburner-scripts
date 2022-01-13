// Syncs scripts from a github repository.
// Takes 1 optional arg. If true, this script first updates itself and then
// runs the new copy in basic mode. Otherwise this script just updates
// everything at once (basic mode);

/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length == 1 && ns.args[0]) {
    const got = await ns.wget("https://raw.githubusercontent.com/spilliams/bitburner-scripts/main/util/git-sync.js", "util_git-sync.js");
    if (!got) {
      ns.tprintf("failed to get util/git-sync.js");
      return;
    }
    await ns.exec("util_git-sync.js", "home", 10);
  } else {
    await downloadAll(ns);
  }
}

/** @param {NS} ns **/
async function downloadAll(ns) {
  const baseURL = "https://raw.githubusercontent.com/spilliams/bitburner-scripts/main";
  const files = [
    "contracts/algorithmicStockTrader.js",
    "contracts/minimumPathSumTriangle.js",
    "contracts/subarrayWithMaximumSum.js",
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
    // wget doesn't work properly to create files in subdirectories
    // and there is no ns.mv?!
    const name = files[i].split("/").join("_");
    const got = await ns.wget(ns.sprintf("%s/%s", baseURL, files[i]), name);
    if (!got) {
      ns.tprintf("failed to download %s", files[i]);
    }
  }
}
