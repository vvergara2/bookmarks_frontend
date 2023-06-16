import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Stack, Alert } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import { Navigate } from 'react-router-dom';

import TagAutocompleteForm from '../TagAutocompleteForm';
import ErrorLoginRedirect from '../ErrorLoginRedirect';
import { checkForError } from '../FetchUtil';

function NewBookmarkForm() {
    const { getValues, register, handleSubmit, watch, formState: { errors } } = useForm();
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [tags, setTags] = useState([]);
    const [items, setItems] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        fetch("/api/groups/me", {
          method:'GET',
        }).then(res => {
          if (!res.ok) {
            return Promise.reject(new Error(res.statusText));
          }
  
          return res.json()
        }).then(
            (result) => {
              setIsLoaded(true);
              setUserGroups(result);
              setError(null);
            },
            (error) => {
              setIsLoaded(true);
              setError(error);
            }
          )
      }, [])

    const onSubmit = data => {
        data.desiredTags = tags;
        fetch("/api/bookmarks", {method:'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(res => checkForError(res))
            .then(res => res.json())
            .then((items) => {
                setIsLoaded(true);
                setItems(items);
                setIsSubmitted(true);
            })
            .catch((error) => {
                setIsLoaded(true);
                setError(error);
            });
    }

    const handleTagSelection = tagData => {
        tags.forEach(existingTag => {
            if (existingTag.tagId == tagData.tagId) {
                return;
            }
        });

        setTags(tags => [...tags, tagData]);
    }

    const removeTag = tagId => {
        let newTagArray = [];
        tags.forEach(existingTag => {
            if (existingTag.tagId != tagId) {
                newTagArray.push(existingTag);
            }
        });

        setTags(newTagArray);
    }

    const resetTags = e => {
        setTags([]);
    }

    return (
        <Row className='justify-content-center'>
            <Col lg={10}>
                <ErrorLoginRedirect error={error} />

                { error && 
                    <Alert variant="danger">Error: {error.message}</Alert>
                }

                { isSubmitted && 
                    <Navigate to={"/bookmarks?groupId=" + getValues("groupId") } />
                }
            
                <Form onSubmit={handleSubmit(onSubmit)} className="">
                    <Form.Group className="mb-3" as={Row} controlId="formGroup">
                        <Form.Label column sm="2">Publish to</Form.Label>
                        <Col sm="10">
                            <Form.Select type="text" placeholder='URL by default' {...register("groupId", {onChange: (e) => resetTags(e), valueAsNumber: true,})}>
                                <option value="-1">Your bookmarks</option>
                                {userGroups.map(group => (
                                    <option key={group.groupId} value={group.groupId}>{group.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="formUrl">
                        <Form.Label column sm="2">URL</Form.Label>
                        <Col sm="10">
                            <Form.Control type="text" {...register("url", { required: true })} />
                        </Col>
                    </Form.Group>
                    <Form.Group className="mb-3" as={Row} controlId="formTitle">
                        <Form.Label column sm="2">Title</Form.Label>
                        <Col sm="10">
                            <Form.Control onChange={(e) => resetTags(e)} type="text" placeholder='URL by default'  {...register("displayTitle")} />
                        </Col>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formDesc">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows={3} {...register("description")} />
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Col>
                            <Row>
                                <Col>Tags</Col>
                            </Row>
                        {tags && tags.map(tag => {
                            return (
                                <Row key={tag.tagId} className="mb-1">
                                    <Col>
                                        <button     
                                            type="button" 
                                            className='btn btn-link p-0 me-1 align-baseline' 
                                            onClick={() => removeTag(tag.tagId)}>
                                            &#10005;
                                        </button> 
                                        {tag.tagId == -1 && "(new)"} {tag.name}
                                    </Col>
                                </Row>
                            )
                        })}
                            <Row>
                                <TagAutocompleteForm onTagSelection={handleTagSelection} allowNewTag groupId={getValues("groupId")} />
                            </Row>
                        </Col>
                    </Form.Group>
                    <Stack direction="horizontal">
                        <Button className="ms-auto" variant="primary" type="submit">
                            Submit
                        </Button>

                    </Stack>
                </Form>
            </Col>
        </Row>
    );
}

export default NewBookmarkForm;