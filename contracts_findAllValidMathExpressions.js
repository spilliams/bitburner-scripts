/** @param {NS} ns **/
export async function main(ns) {
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

// export function findAllValidMathExpessions(ns, data) {
//   // use +, - or *
//   // (or none)
//   // ["577773", 91]
//   // consider first gap: 5 77773
//   // 5+...
//   // 5...
//   const expr = data[1];
//   const permutations = Math.pow(4, expr.length - 1)
// }

export function findAllValidMathExpressions(ns, data) {
  const digits = data[0].split('')
  const operators = ['+', '-', '*', '']
  let expressions = []
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i]
    if (i === 0) {
      expressions = expressions.concat(
        //first number can be negative
        [digit, '-' + digit]
          .flatMap(d => operators.map(op => d + op))
          //remove leading zeroes
          .filter(d => d !== '0' && d !== '-0')
      )
    } else if (i === digits.length - 1) {
      expressions = expressions.map(e => e + digit)
    } else {
      expressions = expressions.flatMap(e =>
        operators.map(op => {
          let exp = e
          //remove leading zeroes
          if (e.endsWith('0')) {
            exp = e.slice(0, -1)
          }
          return exp + digit + op
        })
      )
    }
  }
  return expressions.filter(e => eval(e) === data[1])
}
