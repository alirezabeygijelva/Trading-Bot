export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return  {
                token: action.user.token,
                roles: action.user.roles,
            }
        case 'LOGOUT':
            return null;
        default:
            return state;
    }
}