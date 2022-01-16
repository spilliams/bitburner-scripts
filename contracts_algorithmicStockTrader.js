/** @param {NS} ns **/
export async function main(ns) {
  // 62,40,17,163,22,105,159,50,10,140,172,157,163
  // const data = [174, 90, 36, 90, 195, 3, 182, 80, 104, 121, 131, 78, 184, 31, 2, 195, 29, 148, 173, 65, 5, 36, 139, 11, 131, 14, 78, 51, 21, 83, 106, 164, 74];
  const data = [18, 104, 41, 43, 192, 126, 116, 106, 113, 112, 96, 189, 68, 139, 66, 140];
  // const max = algorithmicStockTrader1(ns, [92, 21, 176, 128, 144, 70, 158, 105, 85, 184, 29, 156, 184, 132, 161, 58, 100, 195, 9, 170, 128, 62, 79, 164, 102, 135, 145, 187, 104, 39, 96, 35, 9, 16, 146, 69, 2]);
  ns.tprintf("[%s]", data.join(", "));
  const max = algorithmicStockTrader3(ns, data);
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
  const l = data.length;
  let memo = empty2D(l);
  let memoTx = empty2D(l);

  for (let buyOn = 0; buyOn < l; buyOn++) {
    let line = "";
    for (let sellOn = 0; sellOn < l; sellOn++) {
      if (buyOn >= sellOn) {
        memo[buyOn][sellOn] = 0;
      } else {
        memo[buyOn][sellOn] = data[sellOn] - data[buyOn];
        memoTx[sellOn][buyOn] = data[sellOn] - data[buyOn];
      }
      line += pad(memo[buyOn][sellOn], 5);
    }
    ns.tprintf(line);
  }
  ns.tprintf("\n");

  let maxProfitIfISellOn = [];
  let line0 = "day:                               ";
  let line1 = "max profit if I sell on:           ";
  let line2 = "max profit if I sell on or before: ";
  let line3 = "max profit if I buy on:            ";
  let line4 = "max profit if I buy after:         ";
  let line5 = "sum of maxes:                      ";
  for (let i = 0; i < l; i++) {
    const maxSell = Math.max(...memoTx[i]);
    maxProfitIfISellOn.push(maxSell);
    line0 += pad(i, 5);
    line1 += pad(maxSell, 5);
  }
  let maxProfitIfISellOnOrBefore = [];
  for (let i = 0; i < l; i++) {
    const maxSell = Math.max(...maxProfitIfISellOn.slice(0, i + 1));
    maxProfitIfISellOnOrBefore.push(maxSell);
    line2 += pad(maxSell, 5);
  }

  let maxProfitIfIBuyOn = [];
  for (let i = 0; i < l; i++) {
    const maxBuy = Math.max(...memo[i]);
    maxProfitIfIBuyOn.push(maxBuy);
    line3 += pad(maxBuy, 5);
  }
  let maxProfitIfIBuyAfter = [];
  for (let i = 0; i < l - 1; i++) {
    const maxBuy = Math.max(...maxProfitIfIBuyOn.slice(i + 1));
    maxProfitIfIBuyAfter.push(maxBuy);
    line4 += pad(maxBuy, 5);
  }
  maxProfitIfIBuyAfter.push(0);
  line4 += pad(0, 5);

  let sumOfMaxes = [];
  for (let i = 0; i < l; i++) {
    const sum = maxProfitIfIBuyAfter[i] + maxProfitIfISellOnOrBefore[i];
    sumOfMaxes.push(sum);
    line5 += pad(sum, 5);
  }

  ns.tprintf([line0, line1, line2, line3, line4, line5].join("\n"));
  return Math.max(...sumOfMaxes);
}

/** @param {NS} ns **/
export function algorithmicStockTrader2(ns, data) {

}

function empty2D(l) {
  let arr = [];
  for (let r = 0; r < l; r++) {
    let emptyRow = [];
    for (let c = 0; c < l; c++) {
      emptyRow.push(0);
    }
    arr.push(emptyRow);
  }
  return arr;
}

function transpose(arr) {
  const l = arr.length;
  let tx = empty2D(l);

  for (let r = 0; r < l; r++) {
    for (let c = 0; c < l; c++) {
      tx[r][c] = arr[c][r];
    }
  }

  return tx;
}

function pad(num, len, char = " ") {
  let str = "" + num;
  while (str.length < len) str = char + str;
  return str;
}
