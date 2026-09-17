FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app
COPY . .

RUN npm install --prefix common

ENTRYPOINT ["./common/run.sh"]
CMD ["sandbox"]
