// deletes all files in any subdirectory on your home computer!
// (useful if you created a / directory by accident)

/** @param {NS} ns **/
export async function main(ns) {
  const files = ns.ls("home");
  ns.tprintf("%v", files.join("\n"));
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.startsWith("/")) {
      continue;
    }
    ns.rm(file, "home");
  }
}
