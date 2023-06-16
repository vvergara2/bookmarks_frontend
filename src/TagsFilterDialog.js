import React, { useState, useEffect, useContext } from 'react';
import { Form, Row, Col, Button, Stack } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ErrorLoginRedirect from './ErrorLoginRedirect';
import { checkForError } from './FetchUtil';

function TagsFilterDialog(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [userGroups, setUserGroups] = useState([]);
    let [searchParams, setSearchParams] = useSearchParams();
    const { register, setValue, getValues, handleSubmit, watch, reset, formState: { errors } } = useForm();

    const onResetForm = data => {
        reset();

        // HACK calling reset() clears disabled attribute on creatorId field
        setValue("groupId", -1);
    }

    const onSubmit = data => {
        props.onFilterApply(new URLSearchParams(data));
    }

    useEffect(() => {
        for (const [key, value] of searchParams.entries()) {
            setValue(key, value);
        }
    }, []);

    useEffect(() => {
        fetch("/api/groups/me", {
          method:'GET',
        })
            .then(res => checkForError(res))
            .then(res => res.json())
            .then((groups) => {
                setUserGroups(groups);
            })
            .catch((error) => {
            });
    }, []);

    useEffect(() => {
        userGroups.forEach((group) => {
            if (searchParams.get("groupId") == group.groupId) {
                setValue("groupId", group.groupId);
            }
        });
        
    }, [userGroups]);

    return (
        <Form onSubmit={handleSubmit(onSubmit)} className="mx-3 mx-lg-0">
            <Form.Group as={Row} className="mb-3">
                <Col>
                    <Form.Label>Active group</Form.Label>
                    <Form.Select className='form-select-sm' type="text" {...register("groupId", {valueAsNumber: true})}>
                        <option value="-1">Your bookmarks</option>
                        {userGroups.map(group => (
                            <option key={group.groupId} value={group.groupId}>{group.name}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
                <Col>
                    <Form.Control className='form-control-sm' {...register("search")} defaultValue="" placeholder='Search' />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
                <Col>
                    <Form.Label>Sort by</Form.Label>
                    <Form.Select className='form-select-sm' {...register("sort")} defaultValue="lastUseDate">
                        <option value="lastUseDate">Last use date</option>
                        <option value="lastUpdatedDate">Updated date</option>
                        <option value="createdDate">Created date</option>
                        <option value="name">Name</option>
                        <option value="owner">Owner</option>
                    </Form.Select>
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
                <Col>
                    <Form.Label>Order</Form.Label>
                    <Form.Select className='form-select-sm' {...register("order")} defaultValue="desc">
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </Form.Select>
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
                <Col>
                    <Form.Label>Creator ID</Form.Label>
                    <Form.Control disabled={getValues("groupId") < 0} className='form-control-sm' {...register("creatorId")} defaultValue="" placeholder='' />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3 text-end">
                <Col>
                    <Stack direction="horizontal">
                        <Button className="btn-sm me-auto" onClick={onResetForm} variant="outline-secondary">Reset</Button>
                        <Button className="btn-sm" type="submit" variant="outline-primary">Apply</Button>
                    </Stack>
                </Col>
            </Form.Group>
        </Form>
    )
}

export default TagsFilterDialog;