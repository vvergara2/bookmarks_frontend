import React, { useState, useEffect } from 'react';
import { Stack, Row, Col, Button, Alert } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useForm } from "react-hook-form";
import { useParams, Navigate } from "react-router-dom";

import TagAutocompleteForm from '../TagAutocompleteForm';
import ErrorLoginRedirect from '../ErrorLoginRedirect';
import { checkForError } from '../FetchUtil';
import DeleteBookmarkModal from '../DeleteBookmarkModal';

function UpdateBookmarkForm() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [bookmarkData, setBookmarkData] = useState({});
    const [tags, setTags] = useState([]);
    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { bookmarkId } = useParams();
  
    useEffect(() => {
        fetch("/api/bookmarks/" + bookmarkId, {method:'GET'})
            .then(res => checkForError(res))
            .then((res) => res.json())
            .then((result) => {
                setIsLoaded(true);
                setBookmarkData(result);

                let tags = [];
                if (result.taggings) {
                    result.taggings.forEach(tagging => {
                        tags.push(tagging.tag);
                    });
                }
                setTags(tags);

                setValue("bookmarkId", result.bookmarkId);
                setValue("displayTitle", result.displayTitle);
                setValue("url", result.url);
                setValue("description", result.description);
            })
            .catch((error) => {
                setIsLoaded(true);
                setError(error);
            });
    }, [])

    const onSubmit = data => {
        data.desiredTags = tags;
        fetch("/api/bookmarks/" + bookmarkId, {
                method:'PUT',
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

    let bookmarksReturnUrl = "/bookmarks";
    if (bookmarkData.group) {
      bookmarksReturnUrl += "?groupId=" + bookmarkData.group.groupId;
    }

    if (isDeleted || isSubmitted) {
      return <Navigate to={bookmarksReturnUrl} />
    }

    if (!isLoaded) {
        return (
            <Row className='justify-content-center'>
                <Col lg={10}>
                    <ErrorLoginRedirect error={error} />

                    { error && 
                        <Alert variant="danger">Error: {error.message}</Alert>
                    }
                    
                    <Form onSubmit={handleSubmit(onSubmit)} className="">
                        <Form.Group as={Row} className="mb-3" controlId="formBookmarkId">
                            <Form.Label column sm="2">Bookmark ID</Form.Label>
                            <Col sm="10">
                            <Form.Control type="text" {...register("bookmarkId")} disabled/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="formUrl">
                            <Form.Label column sm="2">URL</Form.Label>
                            <Col sm="10">
                            <Form.Control type="text" {...register("url")} />
                            </Col>
                        </Form.Group>
                        <Form.Group className="mb-3" as={Row} controlId="formTitle">
                            <Form.Label column sm="2">Title</Form.Label>
                            <Col sm="10">
                            <Form.Control type="text" placeholder='URL by default'  {...register("displayTitle")} />
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
                                <Row>
                                    <TagAutocompleteForm onTagSelection={handleTagSelection} />
                                </Row>
                            </Col>
                        </Form.Group>
                        <Form.Group>
                            <Stack direction="horizontal">
                                <button disabled className="btn btn-outline-danger">
                                    Delete bookmark&hellip;
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
        if (bookmarkData.group) {
            groupId = bookmarkData.group.groupId;
        }
        return (
            <Row className='justify-content-center'>
                <Col lg={10}>
                    <ErrorLoginRedirect error={error} />

                    { error && 
                        <Alert variant="danger">Error: {error.message}</Alert>
                    }

                    <Form onSubmit={handleSubmit(onSubmit)} className="">
                        <Form.Group as={Row} className="mb-3" controlId="formBookmarkId">
                            <Form.Label column sm="2">Bookmark ID</Form.Label>
                            <Col sm="10">
                            <Form.Control type="text" {...register("bookmarkId")} disabled />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="formUrl">
                            <Form.Label column sm="2">URL</Form.Label>
                            <Col sm="10">
                            <Form.Control type="text" {...register("url")} />
                            </Col>
                        </Form.Group>
                        <Form.Group className="mb-3" as={Row} controlId="formTitle">
                            <Form.Label column sm="2">Title</Form.Label>
                            <Col sm="10">
                            <Form.Control type="text" placeholder='URL by default'  {...register("displayTitle")} />
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
                                    <TagAutocompleteForm onTagSelection={handleTagSelection} allowNewTag groupId={groupId} />
                                </Row>
                            </Col>
                        </Form.Group>
                        <Form.Group>
                            <Stack direction="horizontal">
                                <DeleteBookmarkModal 
                                    className="btn btn-outline-danger me-auto" 
                                    onSuccess={() => (setIsDeleted(true))}
                                    onError={(error) => setError(error)}
                                    bookmark={bookmarkData} />
                                <Button variant="primary" type="submit">
                                    Submit
                                </Button>
                            </Stack>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
        );
    };
}

export default UpdateBookmarkForm;