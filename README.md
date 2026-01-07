# basline-backend-system

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).



gcloud builds submit --tag asia-east1-docker.pkg.dev/basline-system/basline/basline-backend-system:latest



gcloud run deploy basline-backend-system \
--image asia-east1-docker.pkg.dev/basline-system/basline/basline-backend-system:latest \
--region asia-east1 \
--platform managed \
--allow-unauthenticated \
--port 8080