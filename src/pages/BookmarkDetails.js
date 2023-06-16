import React, { useState, useEffect } from 'react';
import {Row, Col, Alert} from 'react-bootstrap';
import { Link, useParams, Navigate } from "react-router-dom";

import DeleteBookmarkModal from '../DeleteBookmarkModal';
import ErrorLoginRedirect from '../ErrorLoginRedirect';
import { checkForError } from '../FetchUtil';

function BookmarkDetails() {
    const [error, setError] = useState(null);
    const [bookmarkData, setBookmarkData] = useState(null);
    const [isDeleted, setIsDeleted] = useState(false);
    const { bookmarkId } = useParams();
  
    const makeTagString = tagObj => {
      var ret = "";
      for (var i = 0; i < tagObj.taggings.length; i++) {
          var tag = tagObj.taggings[i].tag;
          if (i == 0) {
              ret += tag.name;
          } else {
              ret += ", " + tag.name;
          }
      }

      return ret;
    }

    useEffect(() => {
      fetch("/api/bookmarks/" + bookmarkId, {method:'GET'})
        .then(res => checkForError(res))
        .then((res) => res.json())
        .then((bookmark) => {
          bookmark.tagList = makeTagString(bookmark);
          setBookmarkData(bookmark);
        })
        .catch((error) => {
          setError(error);
        })
    }, []);

    if (isDeleted) {
      let bookmarkUrl = "/bookmarks";
      if (bookmarkData.group) {
        bookmarkUrl += "?groupId=" + bookmarkData.group.groupId;
      }

      return <Navigate to={bookmarkUrl} />
    }
  
    if (bookmarkData == null) {
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
                <Col xs={2}>URL</Col>
                <Col></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Tags</Col>
                <Col>
                </Col>
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
                <Col xs={2}>Description</Col>
                <Col></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}></Col>
                <Col><Link to={"/bookmarks/" + bookmarkId + "/update"}>Update bookmark&hellip;</Link></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}></Col>
                <Col>
                  <DeleteBookmarkModal 
                    className="btn btn-outline-danger" 
                    onSuccess={() => (setIsDeleted(true))}
                    onError={(error) => setError(error)}
                    bookmark={bookmarkData} />
                </Col>
            </Row>
        
          </Col>
        </Row>
      );

    } else {
      let creatorLink = "/bookmarks/?creatorId=" + bookmarkData.creator.userId;
      if (bookmarkData.group && bookmarkData.group.groupId > 0) {
        creatorLink += "&groupId=" + bookmarkData.group.groupId;
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
                <Col>{bookmarkData.displayTitle}</Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>URL</Col>
                <Col><a href={bookmarkData.url}>{bookmarkData.url}</a></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Tags</Col>
                <Col>
                    {bookmarkData.taggings && bookmarkData.taggings.map(tagging => {
                      let url = "/bookmarks?tagIds=" + tagging.tag.tagId;
                      if (bookmarkData.group && bookmarkData.group.groupId > 0) {
                        url += "&groupId=" + bookmarkData.group.groupId;
                      }
                      return (
                        <Link 
                          to={url}
                          className="me-3"
                          key={tagging.tag.tagId}>
                          {tagging.tag.name}
                        </Link> 
                        );
                    })}
                </Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Owner</Col>
                <Col><Link to={creatorLink}>{bookmarkData.creator.username}</Link></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Date last updated</Col>
                <Col>{(new Date(bookmarkData.lastUpdatedDate)).toLocaleString()}</Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Date created</Col>
                <Col>{(new Date(bookmarkData.createdDate)).toLocaleString()}</Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}>Description</Col>
                <Col>{bookmarkData.description}</Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}></Col>
                <Col><Link to={"/bookmarks/" + bookmarkData.bookmarkId + "/update"}>Update bookmark&hellip;</Link></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={2}></Col>
                <Col>
                  <DeleteBookmarkModal 
                    className="btn btn-outline-danger" 
                    onSuccess={() => (setIsDeleted(true))}
                    onError={(error) => setError(error)}
                    bookmark={bookmarkData} />
                </Col>
            </Row>
        
          </Col>
        </Row>
      );
    }
}

export default BookmarkDetails;