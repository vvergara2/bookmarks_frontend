import React, { useState } from 'react';
import { Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from 'react-router-dom';

import { checkForError } from '../FetchUtil';

function ResetPasswordForm() {
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();
    let [searchParams, setSearchParams] = useSearchParams();

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = data => {
        let formData = {
            "email": data.email,
            "resetPasswordCode": data.resetPasswordCode,
            "newPassword": data.newPassword
        };
        fetch("/api/users/reset_password", {
                method:'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(res => checkForError(res))
            .then(() => {
                setError(null);
                navigate("/login");
            })
            .catch((error) => {
                setError(error);
            });
    }

    return ( 
        <Row className='justify-content-center'>
            <Col lg={10}>
                {error && 
                    <Alert variant="danger">Error: {error}</Alert>
                }
                <Form onSubmit={handleSubmit(onSubmit)} className="">
                    <Form.Group as={Row} className="mb-3" controlId="formEmail">
                        <Form.Label column sm="2">Email</Form.Label>
                        <Col sm="10">
                        <Form.Control type="text" {...register("email", { required: true })} defaultValue={searchParams.get("email")} />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="formResetPasswordCode">
                        <Form.Label column sm="2">Verification code</Form.Label>
                        <Col sm="10">
                        <Form.Control type="text" {...register("resetPasswordCode", { required: true })} defaultValue={searchParams.get("resetPasswordCode")} />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="formNewPassword">
                        <Form.Label column sm="2">New password</Form.Label>
                        <Col sm="10">
                        <Form.Control type="password" {...register("newPassword", { required: true })} />
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

export default ResetPasswordForm;