import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Stack, Alert } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import { useParams, Navigate } from "react-router-dom";

import DeleteTagModal from '../DeleteTagModal';
import ErrorLoginRedirect from '../ErrorLoginRedirect';
import { checkForError } from '../FetchUtil';

function UpdateTagForm() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [tagData, setTagData] = useState([]);
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const { tagId } = useParams();
  
    useEffect(() => {
        fetch("/api/tags/" + tagId, {method:'GET'})
            .then(res => checkForError(res))
            .then(res => res.json())
            .then((result) => {
                setIsLoaded(true);
                setTagData(result);

                setValue("tagId", result.tagId);
                setValue("name", result.name);
            })
            .catch((error) => {
                setIsLoaded(true);
                setError(error);
            });
    }, [])

    const onSubmit = data => {
        fetch("/api/tags/" + tagId, {method:'PUT',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
            .then(res => checkForError(res))
            .then(res => res.json())
            .then(() => {
                setIsSubmitted(true);
            })
            .catch((error) => {
                setError(error);
            });
    }

    let tagsReturnUrl = "/tags";
    if (tagData.group) {
        tagsReturnUrl += "?groupId=" + tagData.group.groupId;
    }

    if (isDeleted || isSubmitted) {
      return <Navigate to={tagsReturnUrl} />
    }

    if (!isLoaded) {
        return (
            <Row className='justify-content-center'>
                <Col lg={10}>
                    <ErrorLoginRedirect error={error} />

                    { error && 
                        <Alert variant="danger">Error: {error.message}</Alert>
                    }

                    <Form className="">
                        <Form.Group as={Row} className="mb-3" controlId="formTagId">
                            <Form.Label column sm="2">Bookmark ID</Form.Label>
                            <Col sm="10">
                            <Form.Control type="text" {...register("tagId")} disabled />
                            </Col>
                        </Form.Group>
                        <Form.Group className="mb-3" as={Row} controlId="formName">
                            <Form.Label column sm="2">Name</Form.Label>
                            <Col sm="10">
                            <Form.Control type="text"  {...register("name", { required: true })} />
                            </Col>
                        </Form.Group>
                        <Form.Group>
                            <Stack direction="horizontal">
                                <button disabled className="btn btn-outline-danger me-auto">
                                    Delete tag&hellip;
                                </button>
                                <button disabled className="btn btn-primary"type="submit">
                                    Submit
                                </button>
                            </Stack>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
        );
      } else {
        let groupId = -1;
        if (tagData.group) {
            groupId = tagData.group.groupId;
        }

        return (
            <Row className='justify-content-center'>
                <Col lg={10}>
                    <ErrorLoginRedirect error={error} />

                    { error && 
                        <Alert variant="danger">Error: {error.message}</Alert>
                    }

                    { isSubmitted && 
                        <Navigate to={"/tags?groupId=" + groupId } />
                    }

                    <Form onSubmit={handleSubmit(onSubmit)} className="">
                        <Form.Group as={Row} className="mb-3" controlId="formTagId">
                            <Form.Label column sm="2">Bookmark ID</Form.Label>
                            <Col sm="10">
                                <Form.Control type="text" {...register("tagId")} disabled />
                            </Col>
                        </Form.Group>
                        <Form.Group className="mb-3" as={Row} controlId="formName">
                            <Form.Label column sm="2">Name</Form.Label>
                            <Col sm="10">
                                <Form.Control type="text"  {...register("name", { required: true })} />
                            </Col>
                        </Form.Group>
                        <Stack direction="horizontal">
                            <DeleteTagModal 
                                className="btn btn-outline-danger me-auto" 
                                onSuccess={() => (setIsDeleted(true))}
                                onError={(error) => setError(error)}
                                tag={tagData}
                                />
                            <button className="btn btn-primary" variant="primary" type="submit">
                                Submit
                            </button>
                        </Stack>
                    </Form>
                </Col>
            </Row>
        );
    };
}

export default UpdateTagForm;