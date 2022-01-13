/** @param {NS} ns **/
export async function main(ns) {
  if (ns.args.length == 1 && ns.args[0]) {
    await ns.wget("https://raw.githubusercontent.com/spilliams/bitburner-scripts/main/util/git-sync.js", "/util/git-sync.js");
    await ns.exec("util/git-sync.js", "home", 10);
  } else {
    await downloadAll();
  }
}

async function downloadAll() {
  const baseURL = "https://raw.githubusercontent.com/spilliams/bitburner-scripts/main";
  const files = [
    "/contracts/algorithmicStockTrader.js",
    "/contracts/minimumPathSumTriangle.js",
    "/contracts/subarrayWithMaximumSum.js",
    "/contracts/totalWaysToSum.js",
    "/notes/bootstrap.txt",
    "/util/formatMoney.js",
    "/util/git-sync.js",
    "/util/recurse.js",
    "/2.js",
    "/backdoor.js",
    "/buy-upgrade.js",
    "/contracts.js",
    "/dark.js",
    "/fix.js",
    "/hostname.js",
    "/infect.js",
    "/kill.js",
    "/list-servers.js",
    "/ls-all.js",
    "/map.js",
    "/open.js",
    "/target.js",
    "/test.js"
  ];
  let promises = [];

  for (let i = 0; i < files.length; i++) {
    promises.push(ns.wget(ns.sprintf("%s%s", baseURL, files[i]), files[i]));
  }

  return promises;
}
