/** @param {NS} ns **/
export async function main(ns) {
  // 62,40,17,163,22,105,159,50,10,140,172,157,163
  let max = algorithmicStockTrader1(ns, [92, 21, 176, 128, 144, 70, 158, 105, 85, 184, 29, 156, 184, 132, 161, 58, 100, 195, 9, 170, 128, 62, 79, 164, 102, 135, 145, 187, 104, 39, 96, 35, 9, 16, 146, 69, 2]);
  ns.tprintf("max profit is %d", max);
}

/** @param {NS} ns **/
export function algorithmicStockTrader1(ns, data) {
  ns.tprintf("%v", data);
  let maxProfit = 0;
  for (let startOne = 0; startOne < data.length - 1; startOne++) {
    for (let endOne = startOne + 1; endOne < data.length; endOne++) {
      const firstProfit = data[endOne] - data[startOne];

      let trans = ns.sprintf("buy day %d, sell day %d = %d", startOne, endOne, firstProfit);
      maxProfit = Math.max(maxProfit, firstProfit);
      if (maxProfit == firstProfit) {
        ns.tprintf("%s", trans);
      }
    }
  }
  return maxProfit;
}

/** @param {NS} ns **/
export function algorithmicStockTrader3(ns, data) {
  let maxProfit = 0;
  for (let startOne = 0; startOne < data.length - 1; startOne++) {
    for (let endOne = startOne + 1; endOne < data.length; endOne++) {
      const firstProfit = data[endOne] - data[startOne];

      let trans = ns.sprintf("buy day %d, sell day %d = %d", startOne, endOne, firstProfit);
      // can we fit a second transaction?
      let secondProfit = 0;
      for (let startTwo = endOne + 1; startTwo < data.length - 1; startTwo++) {
        for (let endTwo = startTwo + 1; endTwo < data.legnth; endTwo++) {
          secondProfit = Math.max(secondProfit, data[endTwo] - data[startTwo]);
          trans = ns.sprintf("buy day %d, sell day %d, buy day %d, sell day %d = %d", startOne, endOne, startTwo, endTwo, firstProfit + secondProfit);
        }
      }

      maxProfit = Math.max(maxProfit, firstProfit + secondProfit);
      if (maxProfit == firstProfit + secondProfit) {
        ns.tprintf("%s", trans);
      }
    }
  }
  return maxProfit;
}
