import { accountServices } from './AccountServices';
import { JsonHelper } from '../utils/JsonHelper';

export const serviceBase = {
    get,
    post,
    put,
    del
}
async function handleError(error) {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
        console.log('DEV: errors', error);
    return { errors: Array.isArray(error) ? error : [error] };
};
async function handleResponse(response) {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
        console.log('DEV: response ', response);

    return response.text().then(text => {
        let responseData = JsonHelper.safeParse(text);
        if (!responseData) {
            responseData = text;
        }
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
            console.log('DEV: responseData ', responseData);
        if (!response.ok) {
            if ([401, 403].indexOf(response.status) !== -1) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                accountServices.logout();
            }

            let error = response.statusText;
            if (responseData?.data?.errors) {
                error = responseData.data.errors;
            }
            else if (responseData?.errors) {
                error = [];
                Object.values(responseData.errors).forEach(e => {
                    if (Array.isArray(e)) {
                        e.forEach(item => {
                            error.push(item);
                        });
                    } else {
                        error.push(e);
                    }
                });
            }
            else if (responseData?.message) {
                error = responseData.message;
            }
            else if (responseData && responseData !== "") {
                error = responseData;
            }
            return Promise.reject(error);
        }

        return responseData;
    });
}

async function get(url) {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
        console.log('DEV: GET URL', url);

    const requestOptions = { method: 'GET', headers: {} };
    if (accountServices.currentUserValue?.token)
        requestOptions.headers['Authorization'] = `Bearer ${accountServices.currentUserValue?.token}`;

    requestOptions.headers['RequestDomain'] = `${window.location.origin}`;
    requestOptions.headers['Accept-Language'] = `${process.env.REACT_APP_ACCEPT_LANGUAGE}`;
    try {
        const response = await fetch(url, requestOptions);
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
}

async function post(url, body) {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
        console.log('DEV: POST URL', url, body);
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
    if (accountServices.currentUserValue?.token)
        requestOptions.headers['Authorization'] = `Bearer ${accountServices.currentUserValue?.token}`;

    requestOptions.headers['RequestDomain'] = `${window.location.origin}`;
    requestOptions.headers['Accept-Language'] = `${process.env.REACT_APP_ACCEPT_LANGUAGE}`;
    try {
        const response = await fetch(url, requestOptions);
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
}

async function put(url, body) {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
        console.log('DEV: PUT URL', url, body);
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
    if (accountServices.currentUserValue?.token)
        requestOptions.headers['Authorization'] = `Bearer ${accountServices.currentUserValue?.token}`;

    requestOptions.headers['RequestDomain'] = `${window.location.origin}`;
    requestOptions.headers['Accept-Language'] = `${process.env.REACT_APP_ACCEPT_LANGUAGE}`;
    try {
        const response = await fetch(url, requestOptions);
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
}

async function del(url, body) {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
        console.log('DEV: Delete URL', url, body);
    const requestOptions = {
        method: 'Delete',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
    if (accountServices.currentUserValue?.token)
        requestOptions.headers['Authorization'] = `Bearer ${accountServices.currentUserValue?.token}`;

    requestOptions.headers['RequestDomain'] = `${window.location.origin}`;
    requestOptions.headers['Accept-Language'] = `${process.env.REACT_APP_ACCEPT_LANGUAGE}`;
    try {
        const response = await fetch(url, requestOptions);
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
}