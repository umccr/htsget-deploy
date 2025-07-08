FROM ghcr.io/umccr/htsget-rs:latest

LABEL org.opencontainers.image.source=https://github.com/umccr/htsget-rs
LABEL org.opencontainers.image.url=https://github.com/umccr/htsget-rs/pkgs/container/htsget-rs
LABEL org.opencontainers.image.description="A server implementation of the htsget protocol for bioinformatics in Rust"
LABEL org.opencontainers.image.licenses=MIT
LABEL org.opencontainers.image.authors="Roman Valls Guimera <brainstorm@nopcode.org>, Marko Malenic <mmalenic1@gmail.com>"

EXPOSE 8080
CMD [ "htsget-axum" ]
