
import React, { useState } from 'react';
import { Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from 'react-router-dom';

import { checkForError } from '../FetchUtil';

function ResetPasswordRequestForm() {
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    let [searchParams, setSearchParams] = useSearchParams();


    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = data => {
        let formData = {
            "email": data.email
        };

        fetch("/api/users/reset_password", {
                method:'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(res => checkForError(res))
            .then(() => {
                setError(null);
                setSearchParams({email: data.email});
                let params = new URLSearchParams({email: data.email});
                navigate({
                    pathname: "/reset_password",
                    search: params.toString(),
                });
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
                        <Form.Control type="text" {...register("email", { required: true })} />
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
export default ResetPasswordRequestForm;