/** @param {NS} ns **/
export async function main(ns) {
  //responsible for scheduling a single cycle of daemon work for the target server
  //as always.. ARRRRGS

  let target = args[0];
  let threadsNeededToWeakenForHack = args[1];
  let threadsNeededToHack = args[2];
  let weakenExecutionTime = args[3];
  let hackExecutionTime = args[4];
  let i = args[5]; //i allows this script to run concurrent copies
  let stepDelay = 7;

  let hackWeakenSleep = (weakenExecutionTime - hackExecutionTime) - stepDelay; //fire weaken a step after
  let discriminationVariable = 'hack';
  let threadsNeeded = threadsNeededToWeakenForHack;

  let scripts = ['reddit_weaken_target.js', 'reddit_hack_target.js'];
  for (let j = 0; j < scripts.length; j++) {
    ns.run(scripts[j], threadsNeeded, target, i, discriminationVariable);
    ns.sleep(hackWeakenSleep * 1000);
    threadsNeeded = threadsNeededToHack;
    discriminationVariable = '';
    hackWeakenSleep = 0.001;
  }
}
