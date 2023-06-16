import React, { useState, useEffect } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { Link, useParams, Navigate } from "react-router-dom";

import DeleteTagModal from '../DeleteTagModal';
import ErrorLoginRedirect from '../ErrorLoginRedirect';
import { checkForError } from '../FetchUtil';

function TagDetails() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [tagData, setTagData] = useState([]);
    const [isDeleted, setIsDeleted] = useState(false);

    const { tagId } = useParams();
  
    useEffect(() => {
      fetch("/api/tags/" + tagId, {method:'GET'})
        .then(res => checkForError(res))
        .then((res) => res.json())
        .then((tag) => {
          setIsLoaded(true);
          setTagData(tag);
        })
        .catch((error) => {
          setError(error);
        });
    }, [])

    if (isDeleted) {
      let tagUrl = "/tags";
      if (tagData.group) {
        tagUrl += "?groupId=" + tagData.group.groupId;
      }

      return <Navigate to={tagUrl} />
    }
  
    if (!isLoaded) {
      return (
        <Row className='justify-content-center'>
          <Col lg={10}>
            <ErrorLoginRedirect error={error} />

            {error && 
              <Alert variant="danger">Error: {error.message}</Alert>
            }

            <Row className="mb-2">
                <Col xs={2}>Title</Col>
                <Col></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Owner</Col>
                <Col></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Date last updated</Col>
                <Col></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Date created</Col>
                <Col></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}></Col>
                <Col></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}></Col>
                <Col><DeleteTagModal tagId={-1} /></Col>
            </Row>
          </Col>
        </Row>
      );
    } else {
      let bookmarkLink = "/bookmarks/?tagIds=" + tagData.tagId;
      if (tagData.group && tagData.group.groupId > 0) {
        bookmarkLink += "&groupId=" + tagData.group.groupId;
      }
      
      let creatorLink = "/tags/?creatorId=" + tagData.creator.userId;
      if (tagData.group && tagData.group.groupId > 0) {
        creatorLink += "&groupId=" + tagData.group.groupId;
      }
      return (
        <Row className='justify-content-center'>
          <Col lg={10}>
            <ErrorLoginRedirect error={error} />

            {error && 
              <Alert variant="danger">Error: {error.message}</Alert>
            }

            <Row className="mb-2">
                <Col xs={2}>Title</Col>
                <Col>{tagData.name}</Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Owner</Col>
                <Col><Link to={creatorLink}>{tagData.creator.username}</Link></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Date last updated</Col>
                <Col>{(new Date(tagData.lastUpdatedDate)).toLocaleString()}</Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Date created</Col>
                <Col>{(new Date(tagData.createdDate)).toLocaleString()}</Col>
            </Row>
            <Row className="mb-2">
              <Col xs={2}></Col>
              <Col><Link to={bookmarkLink}>Tagged bookmarks&hellip;</Link></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}></Col>
                <Col><Link to={"/tags/" + tagId + "/update"}>Update tag&hellip;</Link></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}></Col>
                <Col>
                  <DeleteTagModal 
                    className="btn btn-outline-danger" 
                    onSuccess={() => (setIsDeleted(true))}
                    onError={(error) => setError(error)}
                    tag={tagData}
                    />
                </Col>
            </Row>
          </Col>
        </Row>
      );
    }
}

export default TagDetails;