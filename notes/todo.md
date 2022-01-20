# Immediate Concerns

- totalWaysToSum is broken (see contracts.txt)
- play with [ports](https://bitburner.readthedocs.io/en/latest/netscript/
netscriptmisc.html)
- alias script that builds a command

# ports ideas

orchestrator on home will

- send messages on ports
- start scripts on hosts? like, manage the ratios of g/w/h?
- watch multiple targets?

scripts on other servers will read a port for a command, to execute a single
action against a single target.

some open questions:

- given the information I have about target X, can I estimate how many times I should call `grow` or `weaken` or `hack` on it at the same time?
- how does it work to send a "grow target X" command on a port, to be read by a server with N threads running? Does it make a difference?

# Future Ideas

- script for joining factions and buying augs?
- a script that determines the *best* target (incorporating time to grow/weaken/hack)
