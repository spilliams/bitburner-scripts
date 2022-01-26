/** @param {NS} ns **/
export async function main(ns) {
  const hostName = ns.getHostname();

  //thanks to these sweet functions you no longer have to do this manually
  //THIS FUNCTION ALONE IS VERY EXPENSIVE (4GB!!), comment this out and input them manually if you're having RAM issues.
  const mults = ns.getHackingMultipliers();
  let playerHackingMoneyMult = mults.money;

  //and these are for growth
  let playerHackingGrowMult = mults.growth;
  let bitnodeGrowMult = 1.00;
  let bitnodeWeakenMult = 1.00;

  //IMPORTANTE. Adjust this for bitnodes!
  // //uncomment this at SF-5 to handle your bitnode multipliers for you
  // mults = getBitNodeMultipliers();
  // // ServerGrowthRate: 1,
  // // ServerWeakenRate: 1,
  // // ScriptHackMoney: 1,
  // playerHackingMoneyMult *= mults.ScriptHackMoney; //applying the multiplier directly to the player mult
  // bitnodeGrowMult = mults.ServerGrowthRate;

  // //and this is for weaken
  // bitnodeWeakenMult = mults.ServerWeakenRate;


  //percent to take from the server with each pass, this is something you can configure if you want.. take care though.
  let percentageToSteal = 0.1;

  //-----------------------------HERE BE ARGS.. ARRRGS. And other constants----------

  //first thing's first, args
  let target = args[0];
  //tprint('Calculating daemon constants and getting args for ' + target);
  //Used to formulate growth rate, pulled from start.script
  let constantGrowthRate = args[2];

  //unadjusted server growth rate, this is way more than what you actually get
  let unadjustedGrowthRate = 1.03;

  //max server growth rate, growth rates higher than this are throttled.
  let maxGrowthRate = 1.0035;

  //these are the most important things here.
  let maxMoney = args[1];
  let minSecurity = args[3];
  let serverHackingLevel = args[4];

  //these are the variables we're using to record how long it takes to execute at minimum security
  let growExecutionTime = 0;
  let weakenExecutionTime = 0;
  let hackExecutionTime = 0;

  //track how costly (in security) a growth/hacking thread is.
  let growthThreadHardening = 0.004;
  let hackThreadHardening = 0.002;

  //constant, potency of weaken threads
  let weakenThreadPotency = 0.05 * bitnodeWeakenMult;

  // hacking target requires 1.50GB of RAM to run for 1 thread(s)
  let hackCost = 1.5;

  // weaken-target.script requires 1.55GB of RAM to run for 1 thread(s)
  let weakenCost = 1.555;

  // grow-target.script requires 1.55GB of RAM to run for 1 thread(s)
  let growCost = 1.555;

  // one-time scheduler cost per cycle
  let schedulerCost = 2.40 * 2;

  //step delay to force the timing on the scheduler.
  let stepDelay = 7;

  //window delay is twice the stepDelay
  let windowDelay = stepDelay * 2;

  //activationDelay is what I'm using to say "scripts take a little time to spool up so don't start counting yet"
  let activationDelay = 6;

  //killDelay is what I'm using to say "scripts take a little time to die down", similarly
  let killDelay = 8;

  //--------------- PREEMPTIVE CULL ---------------------------------------------------
  //if previous daemons were running, this kills all their child scripts
  let scriptsToCull = ['reddit_weaken_target.js', 'reddit_grow_target.js', 'reddit_hack_target.js'];
  for (let i = 0; i < scriptsToCull.length; i++) {
    ns.scriptKill(scriptsToCull[i], hostName);
  }

  //according to chapt3r, it shouldn't take terribly long for all kills to finish terminating existing scripts - we sleep here just in case

  ns.sleep(killDelay * 1000);

  //--------------- AND HERE'S THE SCRIPT ITSELF ---------------------------------------
  //this is just a constant loop, I use a var just in case I change my mind.
  let doLoop = true;

  while (doLoop) {
    let changedPercentage = read(1);
    if (changedPercentage !== 'NULL PORT DATA') {
      percentageToSteal = changedPercentage;
    }
    let hackingLevel = getHackingLevel();
    let currentSecurity = getServerSecurityLevel(target);

    if (currentSecurity > minSecurity) {
      //execution times based on current security, how long to sleep, since we're using all available RAM to weaken target
      weakenExecutionTime = getWeakenTime(target);
      weakenExecutionTime = Math.floor(weakenExecutionTime * 1000) / 1000;

      let threadsNeeded = Math.ceil((currentSecurity - minSecurity) / weakenThreadPotency);
      let ramAvailableArray = getServerRam(hostName);
      let ramAvailable = ramAvailableArray[0] - ramAvailableArray[1];
      let threadsUsed = Math.min(Math.floor(ramAvailable / weakenCost), threadsNeeded);

      //this causes the script to pass through this cycle if it can't weaken, causing it to idle until some RAM is free.
      if (threadsUsed > 0) {
        ns.run('reddit_weaken_target.js', threadsUsed, target);
        let delay = (weakenExecutionTime + activationDelay + killDelay);

        ns.sleep(delay * 1000);
      }
    } else {
      let adjGrowthRate = 1 + ((unadjustedGrowthRate - 1) / minSecurity);
      adjGrowthRate = Math.min(maxGrowthRate, adjGrowthRate);
      let serverGrowthPercentage = constantGrowthRate / 100;
      let numServerGrowthCyclesAdjusted = serverGrowthPercentage * bitnodeGrowMult * playerHackingGrowMult;
      let serverGrowth = Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted);

      let neededToMaxInitially = maxMoney / Math.max(ns.getServerMoneyAvailable(target), 1);

      //here we presume that 1 / (percentageToHack) is the actual coefficient to achieve our "recovery" growth each theft.
      let neededToMax = 1 / (1 - percentageToSteal); //maxMoney / Math.max(getServerMoneyAvailable(target), 1);

      //this is the cycles needed not accounting for growth mults (bitnode/player) and growthPercentage yet.
      let cyclesNeededToGrowInitially = Math.log(neededToMaxInitially) / Math.log(adjGrowthRate);
      let cyclesNeededToGrow = Math.log(neededToMax) / Math.log(adjGrowthRate);

      //since the player growth mult and bitnode mult are applied to the *exponent* of the growth formula
      //this pulls them back out. serverGrowthPercentage ends up being a multiplier for threads needed in this case.
      let threadsNeededToGrowInitially = Math.ceil(cyclesNeededToGrowInitially / (serverGrowthPercentage * bitnodeGrowMult * playerHackingGrowMult));

      // let totalGrowCostInitially = threadsNeededToGrowInitially * growCost;

      let threadsNeededToGrow = Math.ceil(cyclesNeededToGrow / (serverGrowthPercentage * bitnodeGrowMult * playerHackingGrowMult));

      let totalGrowCost = threadsNeededToGrow * growCost;

      //execution times based on min security, as a best guess for how much we can do in one weaken cycle.
      weakenExecutionTime = ns.getWeakenTime(target);
      weakenExecutionTime = Math.floor(weakenExecutionTime * 1000) / 1000;

      growExecutionTime = ns.getGrowTime(target);
      growExecutionTime = Math.floor(growExecutionTime * 1000) / 1000;

      hackExecutionTime = ns.getHackTime(target);
      hackExecutionTime = Math.floor(hackExecutionTime * 1000) / 1000;

      //one of the money multipliers, we base it off of min security, but we have to account for the offsets we've fired.
      let difficultyMult = (100 - Math.min(100, minSecurity)) / 100;

      let skillMult = (hackingLevel - (serverHackingLevel - 1)) / hackingLevel;
      //difficulty mult is a constant based on min security, but skill mult is based on your current hacking level.
      let percentMoneyHacked = difficultyMult * skillMult * (playerHackingMoneyMult / 240);

      //I can't imagine your hacking skills being this high but what the hell, it's part of the formula.
      percentMoneyHacked = Math.min(1, Math.max(0, percentMoneyHacked));

      let threadsNeededToHack = Math.floor(percentageToSteal / percentMoneyHacked);
      let percentageToStealForDisplay = Math.floor(percentageToSteal * 100);
      let totalHackCost = (threadsNeededToHack * hackCost);

      let threadsNeededToWeakenForHack = (threadsNeededToHack * hackThreadHardening);
      threadsNeededToWeakenForHack = Math.ceil(threadsNeededToWeakenForHack / weakenThreadPotency);
      // let totalWeakenCostForHack = (threadsNeededToWeakenForHack * weakenCost);

      let threadsNeededToWeakenForGrow = (threadsNeededToGrow * growthThreadHardening);
      threadsNeededToWeakenForGrow = Math.ceil(threadsNeededToWeakenForGrow / weakenThreadPotency);
      let totalWeakenCostForGrow = (threadsNeededToWeakenForGrow * weakenCost);

      let totalCostForAllCycles = totalHackCost + threadsNeededToWeakenForHack + totalGrowCost + totalWeakenCostForGrow + schedulerCost;
      let hostRamAvailable = ns.getServerMaxRam(hostName) - ns.getServerUsedRam(hostName);

      let cyclesSupportedByRam = Math.floor((hostRamAvailable[0] - hostRamAvailable[1]) / totalCostForAllCycles);

      ns.tprintf(
        '%s --- Hack to %s%% x %s cycles with a weaken execution time of %s',
        target,
        percentageToStealForDisplay.toString(),
        cyclesSupportedByRam.toString(),
        weakenExecutionTime.toString()
      );

      let skipHackDueToCycleImperfection = false;
      if (weakenExecutionTime / windowDelay < cyclesSupportedByRam && percentageToSteal < 0.98) { //max of 98%
        ns.tprintf('Based on %s second window timing, percentage to steal of %s is too low. Adjusting for next run-loop.',
          windowDelay.toString(),
          percentageToStealForDisplay.toString()
        );
        percentageToSteal += 0.01;
        skipHackDueToCycleImperfection = true;
      } else if (cyclesSupportedByRam === 0 && percentageToSteal > 0.02) { //minimum of 2%
        ns.tprintf('Current percentage to steal of %s is too high for even 1 cycle. Adjusting for next run-loop.',
          percentageToStealForDisplay.toString()
        );
        percentageToSteal -= 0.01;
        skipHackDueToCycleImperfection = true;
      }

      if (threadsNeededToGrowInitially > 0) {
        let threadsAvailableToGrow = Math.min(threadsNeededToGrowInitially, hostRamAvailable / growCost);
        ns.run('grow-target.script', threadsAvailableToGrow, target);
        ns.tprintf('Server is being grown..');
        let delay = (growExecutionTime + activationDelay + killDelay);
        ns.sleep(delay * 1000);
      } else {
        //pass over this run so that the script can obtain a better cycle estimation.
        if (!skipHackDueToCycleImperfection) {
          for (let i = 0; i < cyclesSupportedByRam; i++) {
            let scripts = ['reddit_hack_scheduler.js', 'reddit_grow_scheduler.js'];
            let threadsNeededForWeaken = [threadsNeededToWeakenForHack, threadsNeededToWeakenForGrow];
            let threadsNeeded = [threadsNeededToHack, threadsNeededToGrow];
            let executionTime = [hackExecutionTime, growExecutionTime];
            for (let j = 0; j < scripts.length; j++) {
              ns.run(scripts[j], 1, target, threadsNeededForWeaken[j], threadsNeeded[j], weakenExecutionTime, executionTime[j], i);
              ns.sleep(stepDelay * 1000);
            }
          }
          ns.sleep((weakenExecutionTime + activationDelay + killDelay) * 1000);
        }
      }
    }
  }
}
