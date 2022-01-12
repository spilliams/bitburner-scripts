// opens up the current host.

/** @param {NS} ns **/
export async function main(ns) {
    let host = ns.getHostname();
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(host);
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(host);
    }
    if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(host);
    }
    if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(host);
    }
    if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(host);
    }

    ns.nuke(host);
    // await ns.installBackdoor();
}
