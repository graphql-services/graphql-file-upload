FROM node:alpine

WORKDIR /app
COPY . /app

RUN rm -rf node_modules && yarn --production

ENTRYPOINT [ ]
CMD [ "yarn", "start" ]