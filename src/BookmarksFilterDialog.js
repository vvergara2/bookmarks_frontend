import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Button, Stack, Form } from 'react-bootstrap';
import { getTag, getSavedTagCache } from './LocalTagCache';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import TagAutocompleteForm from './TagAutocompleteForm';

function BookmarksFilterDialog(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [tags, setTags] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    let [searchParams, setSearchParams] = useSearchParams();
    const { getValues, register, setValue, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const [tagCache, setTagCache] = useState(getSavedTagCache());

    const breakTagSearchParam = () => {
        var finalTags = [];
        let tagIdsString = searchParams.get("tagIds");
        if (tagIdsString) {
            tagIdsString.split(",").forEach(part => {
                let newTag = makeTagStruct(part);

                finalTags.push(newTag);
            });

        }

        return finalTags;
    };

    const makeTagStruct = tagIdStr => {
        let tagId = parseInt(tagIdStr);
        let cachedTag = getTag(tagId, tagCache, setTagCache);

        var newTagData = {};
        newTagData.tagId = tagId;

        if (cachedTag) {
            newTagData.name = cachedTag.name;
        } else {
            newTagData.name = "(tag ID: " + tagId + ")";
        }

        return newTagData;
    }

    const onResetForm = data => {
        setTags([]);
        reset();

        // HACK calling reset() clears disabled attribute on creatorId field
        setValue("groupId", -1);
        setValue("creatorId", "");
    }

    const onSubmit = data => {
        let tagIds = "";
        for (var i = 0; i < tags.length; i++) {
            if (tagIds.length == 0) {
                tagIds += tags[i].tagId;
            } else {
                tagIds += "," + tags[i].tagId;
            }
        }
        data.tagIds = tagIds;
        
        props.onFilterApply(new URLSearchParams(data));
    }

    useEffect (() => {
        let refreshedTags = [];
        for (var i = 0; i < tags.length; i++) {
            let curTag = tags[i];
            let cachedTag = tagCache[curTag.tagId];

            if (!cachedTag) {
                console.warn("had tag in array not in cache. id: " + curTag.tagId);
                refreshedTags.push(curTag);
            } else {
                curTag.name = cachedTag.name;
                refreshedTags.push(curTag);
            }
        }

        setTags(refreshedTags);
    }, [tagCache]);

    useEffect(() => {
        for (const [key, value] of searchParams.entries()) {
            setValue(key, value);
        }

        setTags(breakTagSearchParam());
    }, [searchParams]);

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
              setUserGroups(result);
            },
            (error) => {
            }
          )

    }, []);

    useEffect(() => {
        userGroups.forEach((group) => {
            if (searchParams.get("groupId") == group.groupId) {
                setValue("groupId", group.groupId);
            }
        });
        
    }, [userGroups]);

    const handleTagSelection = tagData => {
        for (var i = 0; i < tags.length; i++) {
            if (tags[i].tagId == tagData.tagId) {
                return;
            }
        }

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
        <Form onSubmit={handleSubmit(onSubmit)} className="mx-3 mx-lg-0">
            <Form.Group as={Row} className="mb-3">
                <Col>
                    <Form.Label>Active group</Form.Label>
                    <Form.Select className='form-select-sm' type="text" {...register("groupId", {onChange: (e) => resetTags(e), valueAsNumber: true,})}>
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
                    <Form.Select className='form-select-sm' {...register("sort")} defaultValue="lastUpdatedDate">
                        <option value="lastUpdatedDate">Updated date</option>
                        <option value="createdDate">Created date</option>
                        <option value="displayTitle">Title</option>
                        <option value="url">URL</option>
                        <option value="visitCount">Visit count</option>
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
                    <Row>
                        <Col>Has any of these tags:</Col>
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
                                <small>{tag.name}</small>
                            </Col>
                        </Row>
                    )
                })}
                    <Row className="mt-2">
                        <TagAutocompleteForm onTagSelection={handleTagSelection} groupId={getValues("groupId")} />
                    </Row>
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
                <Col>
                    <Form.Label>Creator ID</Form.Label>
                    <Form.Control disabled={getValues("groupId") < 0} className='form-control-sm' {...register("creatorId")} defaultValue="" />
                </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
                <Col>
                    <Stack direction="horizontal">
                        <Button className="btn-sm me-auto" onClick={onResetForm} variant="outline-secondary">Reset</Button>
                        <Button className='btn-sm' type="submit" variant="outline-primary">Apply</Button>
                    </Stack>
                </Col>
            </Form.Group>
        </Form>
    )
}

export default BookmarksFilterDialog;