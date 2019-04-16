import axios from 'axios';
import { GET_ERRORS, SET_CURRENT_USER } from './types';
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';

export const registerUser = (userData, history) => dispatch => {
    axios.post('/api/users/register', userData)
        .then(res => history.push('/login'))
        .catch(error => dispatch({ type: GET_ERRORS, payload: error.response.data }));
}

export const loginUser = userData => dispatch => {
    axios.post('/api/users/login', userData)
        .then(res => {
            // extract jwt from response
            const { token } = res.data;

            // save to local storage
            localStorage.setItem('jwtToken', token);

            // set auth header
            setAuthToken(token);

            // decode token to get user data
            const decoded = jwt_decode(token);

            dispatch(setCurrentUser(decoded));
        })
        .catch(error => dispatch({ type: GET_ERRORS, payload: error.response.data }));
}

export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER, payload: decoded
    }
}

export const logoutUser = () => dispatch => {
    // remove token from localStorage
    localStorage.removeItem('jwtToken');

    // remove auth header from future requests
    setAuthToken(false);

    // set current user to empty object which will also set isAuthenticated to false
    dispatch(setCurrentUser({}));
}