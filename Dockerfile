FROM node:18-bullseye

LABEL "Maintainer"="Léo Nonnenmacher"
LABEL "Contact"="contact@retake.fr"

ADD https://github.com/martijnvanbrummelen/nwipe.git /tmp/build

WORKDIR /tmp/build

RUN apt update \
    && apt install -y \
    build-essential \
    pkg-config \
    automake \
    libncurses5-dev \
    autotools-dev \
    libparted-dev \
    libconfig-dev \
    libconfig++-dev \
    dmidecode \
    coreutils \
    smartmontools \
    hdparm

RUN ./autogen.sh \
    && ./configure \
    && make \
    && make install

WORKDIR /app

COPY src/ /app/

RUN ls -la public
RUN npm install express socket.io @xterm/xterm ws node-pty

EXPOSE 3000

CMD ["node", "server.js"]
