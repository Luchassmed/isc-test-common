FROM debian:bookworm-slim

WORKDIR /app
COPY . .

ENTRYPOINT ["./common/run.sh"]
CMD ["sandbox"]
