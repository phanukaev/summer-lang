# syntax=docker/dockerfile:1.7-labs

FROM alpine:3.19
WORKDIR /tsdir/

# set up packages
RUN apk add bash
RUN apk add make
RUN apk add npm
RUN npm install -g typescript

# add a user
RUN adduser -D dockuser

# copy files into container
COPY --parents --chown=dockuser --chmod=644 \
     tsconfig.json Makefile /tsdir/
COPY --parents --chown=dockuser --chmod=744 \
     src /tsdir/
# and set permissions
RUN chown dockuser /tsdir


# start a shell as the user
USER dockuser
ENTRYPOINT bash