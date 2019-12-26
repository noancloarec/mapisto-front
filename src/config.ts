console.log(process.env.NODE_ENV);
let api_path
if (process.env.NODE_ENV === 'development') {
    api_path = 'http://localhost:8080'
} else {
    api_path = 'https://api.mapisto.org'
}
export const config = {
    api_path: api_path
}


