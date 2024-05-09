import React, { createContext, useReducer, useEffect } from 'react';
import { authReducer } from '../reducers/authReducer';

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
    const [user, dispatch] = useReducer(authReducer, [], () => {
        const localData = localStorage.getItem('user');
        return localData ? JSON.parse(localData) : [];
    });
    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(user));
    }, [user]);
    return (
        <AuthContext.Provider value={{ user, dispatch }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;