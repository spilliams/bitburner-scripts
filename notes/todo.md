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

1. Might have to make sure the batch delay time is minimum 100ms or something.
2. Might want to start building them in the background somehow, with promises.
  I can predict how many I'll end up setting up, and the gwhw part can block on
  ports being full until omre come online...
3. may also want to be able to build them externally, so that I can run orch and
  intermittently spin up more bots. This might also involve sending a message on
  a port for the orchestrator saying "i spun up N new bots, adjust your
  estimates accordingly".
4. sort the hosts to track progress better?
5. ok I'm at the point where toasts are TOO MUCH, and so is the constant tprint


# Future Ideas

- script for joining factions and buying augs? (once I get Singularity access)
