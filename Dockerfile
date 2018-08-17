FROM node:alpine

WORKDIR /app
COPY . /app

RUN rm -rf node_modules && yarn

ENTRYPOINT [ "yarn" ]
CMD [ "start" ]