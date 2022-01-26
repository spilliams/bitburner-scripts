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

# Future Ideas

- script for joining factions and buying augs? (once I get Singularity access)
