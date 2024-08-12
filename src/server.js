const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const pty = require("node-pty");
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

const shell = "/usr/local/bin/nwipe";
const shellArgs = ["--PDFreportpath=public/pdf/"]; // Replace by an env var & set public/pdf/ by default

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
    // console.log("PTY process data received:", rawOutput); // need to find a way to format output
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
    return;
  });
}

startPtyProcess();

app.get('/pdfs', (req, res) => {
  const pdfDirectory = path.join(__dirname, 'public', 'pdf');
  
  fs.readdir(pdfDirectory, (err, files) => {
    if (err) {
      console.error("Could not list the directory.", err);
      res.status(500).send("Internal server error");
      return;
    }

    const pdfFiles = files.filter(file => path.extname(file) === '.pdf');

    let html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" type="image/x-icon" href="/img/favicon.ico">
          <title>Retake | WebWipe</title>
          <link rel="stylesheet" href="/css/styles.css" />
        </head>
        <body>
          <h1>Available PDFs</h1>
          <ul>`;

    pdfFiles.forEach(file => {
      html += `<li><a href="/pdf/${file}" download>${file}</a></li>`;
    });

    html += `
          </ul>
        </body>
      </html>`;

    res.send(html);
  });
});

app.get('/pdf/:filename', (req, res) => {
  const file = path.join(__dirname, 'public', 'pdf', req.params.filename);
  res.download(file, err => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send("Internal server error");
    }
  });
});

app.post('/restart', (req, res) => {
  console.log("restart");
  // ptyProcess.kill();
  startPtyProcess();
  res.send("Restarting webwipe")
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
