const socket = new WebSocket("ws://localhost:3000");

var term = new Terminal({
  cursorBlink: false,
});

term.open(document.getElementById("terminal"));

function init() {
  if (term._initialized) {
    return;
  }

  term._initialized = true;

  term.prompt = () => {
    term.write("\r\n$ ");
  };
  prompt(term);

  term.onKey((key) => {
    runCommand(term, key.key);
  });
}

function prompt(term) {
  term.write("\r\n$ ");
}

socket.onmessage = (event) => {
  term.write(event.data);
};

function runCommand(term, command) {
  socket.send(command);
}

document.getElementById('restartButton').addEventListener('click', () => {
  if (confirm('Restarting WebWipe will stop all nwipe running processes and final PDF export will not be possible. Are you sure you want to restart the server ?')) {
    fetch('/restart', {
      method: 'POST',
    })
    .then(response => response.text())
    .then(message => {
      document.getElementById('status').textContent = message;
    })
    .catch(error => {
      document.getElementById('status').textContent = 'Error restarting server.';
      console.error('Error:', error);
    });
  }
});

init();
