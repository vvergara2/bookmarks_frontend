import React, { useState, useContext } from 'react';
import { Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import { Link, Navigate, useSearchParams } from 'react-router-dom';

import { UserDetailsContext } from '../UserDetailsContext';
import { checkForError } from '../FetchUtil';

function LoginForm() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const context = useContext(UserDetailsContext);
    let [searchParams] = useSearchParams();

    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = data => {
        let formData = new FormData();
        formData.append("username", data.username);
        formData.append("password", data.password);

        if (data.rememberMe) {
            formData.append("remember-me", true);
        }

        fetch("/api/perform_login", {
            method:'POST',
            body: formData
        })
            .then(res => checkForError(res))
            .then(() => {
                    context.setUserDetailsNeedsUpdate(true);
                    setError(null);
                    setIsLoaded(true);
            })
            .catch((error) => {
                if (error.message == "401") {
                    setError("The specified login information did not match an existing account.");
                } else {
                    setError(error.message);
                }
            });
    }

    return (
        <Row className='justify-content-center'>
            <Col lg={10}>
                {isLoaded && 
                    <Navigate to="/bookmarks" />
                }
                <Alert variant="light">Don't have an account? <Link to={"/register_user"}>Register here</Link></Alert>
                <Alert variant="light">Forgot your password? <Link to={"/reset_password_request"}>Reset your password</Link></Alert>
                {searchParams.get("sessionExpired") &&
                    <Alert variant="danger">You were logged out. Please log in again.</Alert>
                }
                {error && 
                    <Alert variant="danger">Error: {error}</Alert>
                }
                <Form onSubmit={handleSubmit(onSubmit)} className="">
                    <Form.Group as={Row} className="mb-3" controlId="formUrl">
                        <Form.Label column sm="2">Username</Form.Label>
                        <Col sm="10">
                        <Form.Control type="text" {...register("username", { required: true })} />
                        </Col>
                    </Form.Group>
                    <Form.Group className="mb-3" as={Row} controlId="formTitle">
                        <Form.Label column sm="2">Password</Form.Label>
                        <Col sm="10">
                        <Form.Control type="password"  {...register("password", { required: true })} />
                        </Col>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formLocked">
                        <Form.Check type="checkbox" label="Remember me"  {...register("rememberMe")} />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Col>
        </Row>  
    );
}
export default LoginForm;