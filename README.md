# Retake | WebWipe

![WebWipe](https://retake.fr/wp-content/uploads/2024/06/RETAKE3.png)

## Description

The Nwipe Web Terminal Application transforms your server into a secure disk wiping station accessible from any web browser. It utilizes [xterm.js](https://xtermjs.org/) to provide an interactive terminal interface for managing disk erasures with the [Nwipe](https://github.com/martijnvanbrummelen/nwipe) tool. This setup enables users to connect remotely and perform disk wiping tasks without needing direct access to the server.

Run with:

```bash
docker build -t webwipe .
docker compose up -d --build
```

Try with:

```bash
docker build -t webwipe .
docker run -v /run/udev/:/run/udev/ --privileged -p 3000:3000 -e EXCLUDE="/dev/sda" webwipe
```

## Roadmap

- [x] Create a volume for the logs & PDFs(replaced to a path)
- [x] Build a arm64 image
- [x] Add a healthcheck to the container
- [x] Add CI pipeline to build & push the image
- [x] Add a relaunch button
- [ ] Add health endpoint
- [ ] Improve logs
- [ ] Find a way to refresh device list(no more udev volume)
- [ ] Look for capadd to replace priviliged option