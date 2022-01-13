/** @param {NS} ns **/
export async function main(ns) {
  // 62,40,17,163,22,105,159,50,10,140,172,157,163
  let max = algorithmicStockTrader1(ns, [62, 40, 17, 163, 22, 105, 159, 50, 10, 140, 172, 157, 163]);
  ns.tprintf("max profit is %d", max);
}

/** @param {NS} ns **/
export function algorithmicStockTrader1(ns, data) {
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
