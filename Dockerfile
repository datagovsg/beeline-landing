FROM node:8.9.1-alpine

RUN apk update && apk upgrade && \
   apk add --no-cache bash git openssh

ENV NODE_ENV production

WORKDIR /app

# Copy in package.json into the image and install node modules
# These layers are only rebuilt if package.json changes
COPY package.json  .
RUN npm install && npm cache clean --force

# Copy rest of source code into image
COPY . .

RUN npm run build

RUN mkdir logs

# Expose port 10000 and map to port
EXPOSE 10000
ENV PORT 10000

CMD npm run start
