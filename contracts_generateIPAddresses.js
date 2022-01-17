/** @param {NS} ns **/
export async function main(ns) {
  //  25525511135 -> [255.255.11.135, 255.255.111.35]
  //  1938718066 -> [193.87.180.66]
  // shortest: 1.1.1.1
  // longest: 111.111.111.111
  generateIPAddresses(ns, ns.args[0]);
}

export function generateIPAddresses(ns, data) {
  const str = "" + data;
  const len = str.length;
  if (len < 4 || len > 12) {
    return false;
  }

  const attempts = breakIntoOctets(ns, str, 4);
  let solns = [];
  for (let i = 0; i < attempts.length; i++) {
    let ip = attempts[i].join(".");
    ns.tprintf("%s (%s)", ip, isIP(ip) ? "good" : "bad");
    if (isIP(ip)) {
      solns.push(ip);
    }
  }
  return solns;
}

function breakIntoOctets(ns, str, qty) {
  const maxLength = 3 * qty;
  const spares = maxLength - str.length;
  ns.tprintf("breaking '%s' into %d octets (%d spares)", str, qty, spares);

  if (spares == 0) {
    let octets = [];
    for (let i = 0; i < qty; i++) {
      octets.push(str.slice(3 * i, 3 * (i + 1)));
    }
    return [octets];
  }
  if (spares == qty * 2) {
    let octets = [];
    for (let i = 0; i < qty; i++) {
      octets.push(str.slice(i, i + 1));
    }
    return [octets];
  }

  let minOctetLength = 1;
  if (spares == 1) minOctetLength = 2;
  let maxOctetLength = 3;
  if (spares == (qty * 2) - 1) maxOctetLength = 2;

  let octets = [];
  for (let l = minOctetLength; l <= maxOctetLength; l++) {
    const first = str.slice(0, l);
    const lasts = breakIntoOctets(ns, str.slice(l), qty - 1);
    for (let i = 0; i < lasts.length; i++) {
      let octet = [first];
      const last = lasts[i];
      for (let o = 0; o < last.length; o++) {
        octet.push(last[o]);
      }
      octets.push(octet)
    }
  }
  return octets;
}

function isIP(str) {
  const nums = str.split(".")
  if (nums.length != 4) {
    return false;
  }
  for (let i = 0; i < nums.length; i++) {
    if (!isOctet(nums[i])) {
      return false;
    }
  }
  return true;
}

function isOctet(num) {
  const n = parseInt(num);
  // starts with 0 and is not 0: false
  if (num.slice(0, 1) == "0" && n != 0) return false
  // over 255: false
  if (n > 255) return false;

  return true;
}
