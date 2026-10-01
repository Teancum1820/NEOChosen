import { spawn } from "node:child_process";

const server = spawn(process.execPath, ["scripts/serve-static.mjs"], {
  stdio: "ignore",
  windowsHide: true,
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${process.env.PORT || "4173"}/`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) throw Error("Static preview server did not start");
  await import("./capture-screenshots.mjs");
} finally {
  server.kill();
}
