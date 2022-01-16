/** @param {NS} ns **/
export async function main(ns) {
  // ()a)a()))((
  // +- - +---++
  //  (  )a )a (  )  )  )  (  (
  //  +  -  -  +  -  -  -  +  +
  //  1  0 -1  0 -1 -2 -3 -2 -1
  //
  //  (  )a a (  )  )  )  (  (
  //  +  -    +  -  -  -  +  +
  //  1  0    1  0 -1 -2 -1  0
  //
  //  +  -  -  +  -  -  -  +  +
  //  1  0 -1  0 -1 -2 -3 -2 -1
  //
  // what is the minimum number it *could* have?
  // once it's self-contained, count em up?
  // ()a)a()))(( original
  // ()a)a())) removed leading ) and trailing ( -> removed 2 so far
  // count: (=2, )=5 -> so we have to remove at least 3 ), to make for 5 removed
  // ok so if we remove 3 ), does it make sense?
  // (aa()): yes
  // (aa()): yes but dupe
  // (aa()): yes but dupe
  // (a)a(): yes
  // (a)a(): yes but dupe
  // (a)a(): yes but dupe
  // ()aa(): yes
  // ()aa(): yes but dupe
  // ()aa(): yes but dupe
  // ()a)a(: no
  // 3 answers

  // generalize...
  // remove leading )
  // remove trailing (
  // count each
  // figure out how many of one to remove.
  // it's a minimum game, so you don't have to remove more than this number
  // (probably).

  // remove N of M instances. do this systematically.
  // after removing a set of N, check that the remaining expression is valid
  // (does it go negative at any point?)
  // if the expression is valid, put it in the pile.
  // after checking all expressions, look at the pile
  // if the pile is empty, uh oh, we have to remove one of the other parens.
  //  (maybe defer this problem. return false and let the human solve it when it
  //   needs solving).
  // if the pile is not empty, dedupe it and return it.
}

export function sanitizeParenthesesExpression(ns, data) {

}
