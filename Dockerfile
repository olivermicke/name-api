FROM node:15.2.1-alpine3.10

WORKDIR /usr/app

COPY package.json .

RUN yarn --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]
