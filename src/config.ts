let apiPath;
if (process.env.NODE_ENV === 'development') {
    apiPath = 'http://localhost:5000';
} else {
    apiPath = `${window.location.protocol}//api.${window.location.host}`;
}
export const config = {
    api_path: apiPath,
    precision_levels: [1, 5, 10, 20, 50]
};


