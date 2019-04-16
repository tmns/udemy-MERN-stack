import axios from 'axios';

const setAuthToken = token => {
    if (token) {
        // set auth token on every request
        axios.defaults.headers.common['Authorization'] = token;
    } else {
        // delete auth header
        delete axios.defaults.headers.common['Authorization'];
    }
}

export default setAuthToken;