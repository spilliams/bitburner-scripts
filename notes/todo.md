# Immediate Concerns

- totalWaysToSum is broken
- alias script that builds a command to run to alias a `gotoX` for every host

# orchestration

first working iteration of orch.js and 4.js results in at least a solid
`prepareTarget` loop. So far I've observed it work on a very bankrupt ECorp,
to the effect of a 0.5 hacking exp/sec/bot.

There is a lot of space left on these bots. I bet I could run 4.js on each bot
as up to 20 different scripts (4-1.js through 4-20.js), and register them all as
separate helpers.

There would still be some bots (notably the servers I've bought) that have more
than enough ram for 20 single-threaded scripts, so maybe then I start thinking
about how to orchestrate multi-threaded stuff. Divide each helper into 20
(unequal) segments, run 4.js 20 times in many threads, have orch remember how
many threads are running on a helper...

the simpler solution might be to only run 4.js per batch, not long-term. Then I
can know more definitely *this* is the server I'm running this on, and this is
how many threads I'll use right now.  
The quetion then becomes, how do I track the availability of my bots?

Actually, I might have a better solution:
run 4.js as many times as possible on each bot server. This is really intensive
to set up, but hopefully once it's running it does ok?

1. Might want to start building them in the background somehow, with promises.
  I can predict how many I'll end up setting up, and the gwhw part can block on
  ports being full until omre come online...
2. may also want to be able to build them externally, so that I can run orch and
  intermittently spin up more bots. This might also involve sending a message on
  a port for the orchestrator saying "i spun up N new bots, adjust your
  estimates accordingly".
3. For where I'm at now with ecorp (max 99 bots per host), I'm not even using a
quarter of my pool for the one target:
3538 bots in the pool
Preparing target ecorp
grow time is 294789ms
weaken time is 368486ms
batch time (GW) is 368.987s total, 1000ms hot (0.27% hot)
I want to run 369 batches at once (738 helpers)
So for these early tests I'm turning `maxBotsPerHost` wayyy down. And later we
can talk about multiple targets. because running all hosts at 100% bots means I
can likely hit every single target in the game as quickly as I want to...jesus.
4. (it might still be simpler to try to run 4.js multi-threaded, to decrease
thread time, instead of running more threads)

# Future Ideas

- script for joining factions and buying augs? (once I get Singularity access)
