
export function reportError(msg) {
    console.warn(msg);
    // TODO: log this somehow
}



export function deepFreeze(object) {
    const propNames = Object.getOwnPropertyNames(object);
    for (const name of propNames) {
        const value = object[name];
        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    }
    return Object.freeze(object);
}



const ISLOCALHOST = window.location.href.includes('localhost:')
                 || window.location.href.startsWith('file:///');
const URL_BASE = ISLOCALHOST
    ? 'http://localhost:5000'
    : 'https://polosero.pythonanywhere.com';

function getToken() {
    let token = sessionStorage.getItem('auth-token');
    if (!token) {
        for (const cookie of document.cookie.split(';')) {
            const [name, value] = cookie.split('=');
            if (name === 'auth-token')
                token = value;
        }
    }
    return token;
}

/**
 * Same as builtin fetch, but with correct backend url and authorization header
 * endpoint is absolute path on the server  e.g. '/character/list'
 * init is same as the builtin fetch's init object
 */
export function authFetch(endpoint, init = {}) {
    if (!endpoint.startsWith('/'))
        throw new Error('endpoint must start with /');
    const headers = new Headers(init.headers);
    headers.append('Authorization', `Bearer ${getToken()}`);
    return fetch(URL_BASE + endpoint, {
        headers,
        ...init,
    });
}

