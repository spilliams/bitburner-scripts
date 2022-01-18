/** @param {NS} ns **/
export async function main(ns) {
  // for (let i = 0; i < 65; i++) {
  //   ns.tprintf("'%s'", opStr(i, 4));
  // }

  // ["123",6] -> [1+2+3, 1*2*3]
  // ["105",5] -> [1*0+5, 10-5]
  // ["82180", -90]
  // ["694385979", 31]
  // ["9167024584", 58]
  // ["82053", -36]
  // ["9259", -16]
  // ["700679512", 18]
  // ["577773", 91]
  const data = ["105", 5];
  const exprs = findAllValidMathExpressions(ns, data);
  for (let i = 0; i < exprs.length; i++) {
    ns.tprintf(exprs[i]);
  }
}

export function findAllValidMathExpressions(ns, data) {
  // ["012345", N], where N is the assertion
  // each gap between two digits can be one of 4 things (blank, -, +, *),
  // so there are 4^d permutations, where d=length-1
  let answers = [];
  const digits = data[0];
  const assertion = data[1];
  // how many we gotta do?
  const permutations = Math.pow(4, digits.length - 1)
  for (let i = 0; i < permutations; i++) {
    // turn the permutation number into a list of operators
    const ops = opStr(i, digits.length - 1);
    // interleave digits and ops
    let expr = "";
    for (let j = 0; j < ops.length; j++) {
      expr += digits[j] + ops[j];
    }
    expr += digits[ops.length];
    // leading 0s sometimes throw an error about octals
    try {
      if (eval(expr) == assertion) {
        answers.push(expr);
      }
    } catch (e) {

    }
  }
  return answers;
}

function opStr(mu, len) {
  const ops = ["", "-", "+", "*"];
  let s = [];
  while (mu >= 4) {
    s.push(ops[mu % 4]);
    mu -= mu % 4;
    mu /= 4;
  }
  s.push(ops[mu]);
  while (s.length < len) {
    s.push(ops[0]);
  }
  return s;
}
