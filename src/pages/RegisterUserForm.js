import React, { useState } from 'react';
import { Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import { useSearchParams, Link, Navigate } from 'react-router-dom';

import { checkForError } from '../FetchUtil';


function RegisterUserForm() {
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    let [searchParams, setSearchParams] = useSearchParams();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = data => {
        fetch("/api/users", {
                method:'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(res => checkForError(res))
            .then(res => res.text())
            .then(res => {
                let newSearchParams = new URLSearchParams({"email": data.email});

                // in demo mode, register user will return the verify code in the response
                if (res.length > 0) {
                    newSearchParams.set("verifyCode", res);
                }

                setError(null);
                setSearchParams(newSearchParams);
                setIsSubmitted(true);
            }) 
            .catch((errorResult) => {
                setError(errorResult);
            });
    }

    return (
        <Row className='justify-content-center'>
        <Col lg={10}>
            {isSubmitted &&
                <Navigate to={"/verify_user?" + searchParams.toString()} />
            }
            <Alert variant="light">Already have an account? <Link to={"/login"}>Log in here</Link></Alert>
            {error && 
                <Alert variant="danger">Error: {error.message}</Alert>
            }
            <Form onSubmit={handleSubmit(onSubmit)} className="">
                <Form.Group as={Row} className="mb-3" controlId="formEmail">
                    <Form.Label column sm="2">Email</Form.Label>
                    <Col sm="10">
                    <Form.Control type="text" {...register("email", { required: true })} />
                    </Col>
                </Form.Group>
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
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </Col>
        </Row>  
    );
}
export default RegisterUserForm;