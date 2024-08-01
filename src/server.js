const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const pty = require("node-pty");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

const shell = "/usr/local/bin/nwipe";
const shellArgs = ["--PDFreportpath=public/pdf/"];

const excludeEnv = process.env.EXCLUDE;

if (excludeEnv) {
  shellArgs.push(`--exclude=${excludeEnv}`);
}

let clients = [];
let terminalState = "";
let ptyProcess;

function startPtyProcess() {
  console.log("Starting PTY process with args:", shellArgs);
  ptyProcess = pty.spawn(shell, shellArgs, {
    name: "xterm-color",
    env: process.env,
  });

  ptyProcess.on("data", (rawOutput) => {
    console.log("PTY process data received:", rawOutput);
    const processedOutput = outputProcessor(rawOutput);
    terminalState += processedOutput;
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(processedOutput);
      }
    });
  });

  ptyProcess.on("error", (err) => {
    console.error("Pty process error:", err);
  });

  ptyProcess.on("exit", (code, signal) => {
    console.log(`Pty process exited with code ${code} and signal ${signal}`);
    // Restart the process if it exits unexpectedly
    startPtyProcess();
  });
}

startPtyProcess();

app.post('/restart', (req, res) => {
  if (ptyProcess) {
    ptyProcess.kill();
    ptyProcess.on('exit', () => {
      console.log("PTY process killed, restarting now");
      startPtyProcess();
    });
  } else {
    startPtyProcess();
  }

  res.send('Pty process has been restarted.');
});

wss.on("connection", (ws) => {
  clients.push(ws);

  if (terminalState) {
    ws.send(terminalState);
  }

  ws.on("message", (command) => {
    if (ptyProcess) {
      ptyProcess.write(commandProcessor(command));
    }
  });

  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
  });
});

const commandProcessor = (command) => command;
const outputProcessor = (output) => output;
