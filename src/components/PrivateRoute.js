
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { accountServices } from '../services/AccountServices';

function PrivateRoute({ roles }) {
    const { pathname } = useLocation();
    const currentUser = accountServices.currentUserValue;
    const currentUserRoles = accountServices.currentUserRoles;
    if (currentUser && (pathname === '/login' || pathname === '/register')) {
        //DELETED FOR CLIENT VERSION
        return <Navigate replace to={{ pathname: '/financemanagement' }} />
    }
    if (!currentUser) {
        if (pathname === '/login' || pathname === '/register') {
            return <Outlet />
        }

        // not logged in so redirect to login page with the return url
        return <Navigate replace to={{ pathname: '/login', state: { from: pathname } }} />
    }
    // check if route is restricted by role
    if (roles && !roles.some(role => currentUserRoles?.includes(role))) {
        // role not authorised so redirect to home page
        //DELETED FOR CLIENT VERSION
        return <Navigate replace to={{ pathname: '/financemanagement' }} />
    }
    return <Outlet />
}

export default PrivateRoute;