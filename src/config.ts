let apiPath;
if (process.env.NODE_ENV === 'development') {
    apiPath = 'http://localhost:8080';
} else {
    apiPath = 'https://api.mapisto.org';
}
export const config = {
    api_path: apiPath,
    precision_levels: [1, 5, 10, 20, 50]
};


