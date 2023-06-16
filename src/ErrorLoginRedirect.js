import React, { useState, useEffect, useContext } from 'react';
import { UserDetailsContext } from './UserDetailsContext';
import { Navigate } from 'react-router-dom';

function ErrorLoginRedirect(props) {
    const {
      setUserLoggingOut
    } = useContext(UserDetailsContext);

    useEffect(() => {
        if (props.error && props.error.message == 401) {
            setUserLoggingOut(true);
        }
    }, [props.error]);

    return (
        <>
        </>
    );
}

export default ErrorLoginRedirect;