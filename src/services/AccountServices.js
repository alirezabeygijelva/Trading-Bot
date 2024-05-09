import { serviceBase } from './ServiceBase';
import { BehaviorSubject } from 'rxjs';
import { contentHelper } from '../utils/ContentHelper';
import navigationService from './NavigationService';
const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')));

export const accountServices = {
    sendMessage,
    register,
    login,
    logout,
    setPassword,
    sendConfirmationEmail,
    validateEmail,
    sendForgotPasswordEmail,
    getUsers,
    getValidUsers,
    getUser,
    getProfile,
    update,
    create,
    changeStatus,
    getUserCount,
    changePassword,
    updateProfile,
    uploadAvatar,
    getAvatar,
    getRoles,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue() { return currentUserSubject.value },
    get currentUserRoles() {
        if (currentUserSubject?.value?.token)
            return contentHelper.parseJwt(currentUserSubject.value.token)['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        return [];
    },
    get currentUserId() {
        if (currentUserSubject?.value?.token)
            return contentHelper.parseJwt(currentUserSubject.value.token)['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        return [];
    }
}

async function sendMessage(name, email, message) {
    var url = `${process.env.REACT_APP_AUTH_URL}/karabot/sendMessage`;
    var body = {
        "name": name,
        "email": email,
        "messageText": message
    };
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

async function register(firstname, lastname, username, email, password, phoneNumber) {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/register`;
    var body = {
        "firstname": firstname,
        "lastname": lastname,
        "username": username,
        "email": email,
        "password": password,
        "phoneNumber": phoneNumber
    };
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

async function login(username, password) {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/login`;
    var body = {
        "username": username,
        "password": password
    };
    return await serviceBase.post(url, body).then((response) => {
        if (response?.data?.token) {
            if (process.env.NODE_ENV && process.env.NODE_ENV === 'development')
                console.log('DEV: token', contentHelper.parseJwt(response.data.token))
            const user = {
                token: response.data.token,
                name: contentHelper.parseJwt(response.data.token)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"],
                email: contentHelper.parseJwt(response.data.token)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
                avatar: contentHelper.parseJwt(response.data.token)["http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata"]
            };
            user.avatar = user.avatar === "" ? null : user.avatar;
            localStorage.setItem('currentUser', JSON.stringify(user));
            currentUserSubject.next(user);
            return user;
        }
        return response.errors || [response.message];
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

function logout() {
    window.postMessage("karabot_user_logout");
    localStorage.removeItem('currentUser');
    currentUserSubject.next(null);
    navigationService.navigate('/');
}

async function sendConfirmationEmail(email) {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/sendConfirmationEmail?email=${email}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

async function validateEmail(querystring) {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/validateEmail?q=${encodeURIComponent(querystring)}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

async function sendForgotPasswordEmail(email) {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/sendForgotPasswordEmail?email=${email}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}


async function setPassword(querystring, password) {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/setpassword?q=${encodeURIComponent(querystring)}`;
    var body = `${password}`;
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

async function getUsers() {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/userList?`;

    // if (index)
    // url = `${url}index=${index}&`;
    // if (size)
    // url = `${url}size=${size}&`;

    return serviceBase.get(url)
        .then((response) => {
            // if (response?.data) {
            //     return response.data;
            // }
            // return [];
            return response;
        });
}

async function getValidUsers() {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/getValidUsers`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data.map(s => ({ value: s.id, label: s.fullName, firstName: s.firstName, lastName: s.lastName, userName: s.username }));
            }
            return [];
        });
}

async function getUser(username) {
    if (!username) {
        username = contentHelper.parseJwt(currentUserSubject.value.token)['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    }
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/Get?username=${username}`;
    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function getProfile() {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/profile`;
    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function update(data) {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/update`;
    return await serviceBase.post(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

async function create(data) {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/create`;
    return await serviceBase.post(url, data).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

async function changeStatus(username) {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/changeStatus?username=${username}`;
    return await serviceBase.post(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

async function getUserCount() {
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/getUserCount`;
    return await serviceBase.get(url).then((response) => {
        return response?.data ?? 0;
    });
}

async function getRoles() {
    var url = `${process.env.REACT_APP_AUTH_URL}/Authenticate/getUserRoles`;
    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}

async function changePassword(data) {
    var username = contentHelper.parseJwt(currentUserSubject.value.token)['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/changePassword`;
    var body = {
        oldPassword: data.oldPassword,
        password: data.password,
        username: username
    }
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

async function updateProfile(data, avatarUrl) {

    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/updateProfile`;
    var body = {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        avatarUrl: avatarUrl
    }
    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    }, (error) => {
        if (Array.isArray(error))
            return error;
        return [error]
    });
}

async function uploadAvatar(fileUrl) {
    if (fileUrl) {
        return await serviceBase.post(`https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMGBB_KEY}&image=${fileUrl}`)
            .then((response) => {
                if (response.success) {
                    return response.data.url;
                }
                else {
                    return ["Upload avatar failed!"]
                }
            });
    }
}

async function getAvatar() {
    var username = contentHelper.parseJwt(currentUserSubject.value.token)['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    var url = `${process.env.REACT_APP_AUTH_URL}/authenticate/getAvatar?username=${username}`;
    return await serviceBase.get(url).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return response.data;
            }
            return response.errors || [response.message];
        }
    });
}