# Retake | WebWipe

![WebWipe](https://github.com/Retake-IT/.github/raw/main/images/logo.png)

## Description

WebWipe transforms your server into a secure disk wiping station accessible from any web browser. It utilizes [xterm.js](https://xtermjs.org/) to provide an interactive terminal interface for managing disk erasures with the [Nwipe](https://github.com/martijnvanbrummelen/nwipe) tool. This setup enables users to connect remotely and perform disk wiping tasks without needing direct access to the server.

:warning: WebWipe uses priviliged containers and have acces to /dev. Don't consider the access to this application secure! :warning:

Run with:

```bash
docker build -t webwipe .
docker compose up -d --build
```

Try with:

```bash
docker build -t webwipe .
docker run -v /dev:/dev --privileged -p 3000:3000 -e EXCLUDE="/dev/sda,/dev/zram0" webwipe
```

## Roadmap

- [x] Create a volume for the logs & PDFs(replaced to a path)
- [x] Build a arm64 image
- [x] Add a healthcheck to the container
- [x] Add CI pipeline to build & push the image
- [x] Add a relaunch button
- [ ] Add health endpoint
- [ ] Improve logs
- [x] Find a way to refresh device list(no more udev volume)
