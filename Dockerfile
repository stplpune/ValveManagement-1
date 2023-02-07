# stage 1

FROM node:latest AS my-app-build
WORKDIR /valvemangement
COPY . .
RUN npm install --legacy-peer-deps && npm run build --prod

# stage 2

FROM nginx:alpine
COPY --from=my-app-build /valvemangement/dist/ValveManagement /usr/share/nginx/html
EXPOSE 80