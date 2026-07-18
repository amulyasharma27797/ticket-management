FROM node:20-alpine AS base

WORKDIR /app

COPY apps/frontend/package.json ./
RUN npm install

COPY apps/frontend/ ./

EXPOSE 5173

FROM base AS development

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=20s \
  CMD wget -qO- http://localhost:5173/ > /dev/null || exit 1

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build

ARG VITE_API_URL=http://localhost:8000/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM nginx:1.27-alpine AS production

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=10s \
  CMD wget -qO- http://localhost/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
