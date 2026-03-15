FROM node:24
COPY . .
RUN yarn
RUN yarn run build
EXPOSE 3000
CMD [ "node", "--max-http-header-size=100000", "build" ]