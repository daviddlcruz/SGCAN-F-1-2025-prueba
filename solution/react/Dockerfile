# Use the official Node.js image
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache bash wget curl

RUN wget -qO- https://get.pnpm.io/install.sh | SHELL="$(which bash)" bash

ENV PATH="/root/.local/share/pnpm:$PATH"

COPY app/package.json app/pnpm-lock.yaml ./

RUN pnpm install

COPY app ./

EXPOSE 3000

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
