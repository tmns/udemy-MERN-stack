const Validator = require('validator');
const isEmpty = require('./is_empty');

module.exports = function valdiateLoginInput(data) {
    let errors = {};

    if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'Name must be between 2 and 30 characters';
    }

    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';


    if (!Validator.isEmpty(data.email)) {
        errors.email = 'Email field is required.'
    }

    if (!Validator.isEmail(data.email)) {
        errors.email = 'Email is invalid.'
    }

    if (!Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required.'
    }

    if (!Validator.isEmpty(data.password2)) {
        errors.password2 = 'Confirm Password field is required.'
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }
}