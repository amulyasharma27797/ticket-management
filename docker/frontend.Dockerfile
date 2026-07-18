FROM node:20-alpine

WORKDIR /app

COPY apps/frontend/package.json ./
RUN npm install

COPY apps/frontend/ ./

EXPOSE 5173

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=20s \
  CMD wget -qO- http://localhost:5173/ > /dev/null || exit 1

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
