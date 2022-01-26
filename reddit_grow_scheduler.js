/** @param {NS} ns **/
export async function main(ns) {
  //responsible for scheduling a single cycle of daemon work for the target server
  //as always.. ARRRRGS

  let target = args[0];
  let threadsNeededToWeakenForGrow = args[1];
  let threadsNeededToGrow = args[2];
  let weakenExecutionTime = args[3];
  let growExecutionTime = args[4];
  let i = args[5]; //i allows this script to run concurrent copies

  let stepDelay = 7;

  let scripts = ['reddit_weaken_target.js', 'reddit_grow_target.js'];
  //moved this out of the two-script "loop" to optimize out an if statement.
  let threadsNeeded = threadsNeededToWeakenForGrow;
  let growWeakenSleep = (weakenExecutionTime - growExecutionTime) - stepDelay; //fire grow's weaken a step later
  let discriminationVariable = 'grow'; //this allows two weakens with the same index-arg to exist at the same time.
  for (let j = 0; j < scripts.length; j++) {
    ns.run(scripts[j], threadsNeeded, target, i, discriminationVariable);
    nssleep(growWeakenSleep * 1000); //waits a step.
    threadsNeeded = threadsNeededToGrow; //sets up the threads needed for the next pass.
    discriminationVariable = '';
    growWeakenSleep = 0.001; //causes the sleep cycle to be arbitrarily slow.
  }
}
