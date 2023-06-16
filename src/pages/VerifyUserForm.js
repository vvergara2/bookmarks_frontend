import React, { useState } from 'react';
import { Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from 'react-router-dom';

import { checkForError } from '../FetchUtil';

function VerifyUserForm() {
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    let [searchParams, setSearchParams] = useSearchParams();

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = data => {
        let formData = {
            "email": data.email,
            "verifyCode": data.verifyCode
        };
        fetch("/api/users/verify", {
                method:'POST',
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
                    <Form.Group as={Row} className="mb-3" controlId="formUrl">
                        <Form.Label column sm="2">Verification code</Form.Label>
                        <Col sm="10">
                        <Form.Control type="text" {...register("verifyCode", { required: true })} defaultValue={searchParams.get("verifyCode")} />
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
export default VerifyUserForm;