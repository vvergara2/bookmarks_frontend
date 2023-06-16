import React, { useState, useEffect } from 'react';
import { Row, Col, Table } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';

import BookmarksFilterDialog from '../BookmarksFilterDialog';
import PageControl from '../PageControl';
import ErrorLoginRedirect from '../ErrorLoginRedirect';
import { checkForError } from '../FetchUtil';

function AllBookmarks() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    let [searchParams, setSearchParams] = useSearchParams();
    const [needToApplyChanges, setNeedToApplyChanges] = useState(true);

    function handleFilterChange(newFilterProps) {
      setSearchParams(new URLSearchParams(newFilterProps));
      setIsLoaded(false);
      setNeedToApplyChanges(true);
    }

    function handlePageChange(newPage) {
      searchParams.set("page", newPage);
      setSearchParams(searchParams);
      setIsLoaded(false);
      setNeedToApplyChanges(true);
    }

    const filterDialog = <BookmarksFilterDialog onFilterApply={handleFilterChange} />;
    const pageControl = <PageControl pageData={items} onPageChange={handlePageChange} />;

    const selectTag = tagId => {
      let tagIdArray = [];
      let tagIdsStr = searchParams.get("tagIds");

      if (tagIdsStr) {
        tagIdsStr.split(",").forEach(part => {
          tagIdArray.push(parseInt(part));
        });
  
        if (tagIdArray.indexOf(tagId) != -1) {
          // tag already present
          return;
        }
      }

      tagIdArray.push(tagId);

      let tagIds = "";
      for (var i = 0; i < tagIdArray.length; i++) {
          if (tagIds.length == 0) {
              tagIds += tagIdArray[i];
          } else {
              tagIds += "," + tagIdArray[i];
          }
      }

      searchParams.set("tagIds", tagIds);
      setSearchParams(searchParams);
    }

    const selectOwner = creatorId => {
      searchParams.set("creatorId", creatorId);
      setSearchParams(searchParams);
    }
  
    useEffect(() => {
      if (!needToApplyChanges) {
        return;
      }

      fetch("/api/bookmarks?" + searchParams.toString(), {
        method:'GET',
      })
        .then(res => checkForError(res))
        .then((res) => res.json())
        .then((items) => {
          setIsLoaded(true);
          setItems(items);
          setError(null);
        })
        .catch((error) => {
          setIsLoaded(true);
          setError(error);
        });
      
      setNeedToApplyChanges(false);
    }, [needToApplyChanges])
  
    let tableBody = <tbody></tbody>;

    if (error) {
      tableBody =
        <tbody>
          <tr>
            <td>Error: {error.message} <ErrorLoginRedirect error={error} /></td>
            <td className="d-none d-lg-table-cell"></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>;
    } else if (!isLoaded) {
      tableBody =
        <tbody>
          <tr>
            <td>Loading&hellip;</td>
            <td className="d-none d-lg-table-cell"></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>;
    } else {
      tableBody = 
        <tbody>
          {items.content.map(item => {
            let groupId = searchParams.get("groupId");

            let creatorComponent = <span>{item.creator.username}</span>;
            if (groupId && groupId > 0) {
              creatorComponent = 
                <button 
                  type="button" 
                  className='btn btn-link p-0 me-1 align-baseline' 
                  onClick={() => (selectOwner(item.creator.userId))}>
                  {item.creator.username}
                </button>;
            }

            return (
              <tr key={item.bookmarkId}>
                <td><a href={item.url}>{item.displayTitle}</a></td>
                <td className="d-none d-lg-table-cell">{creatorComponent}</td>
                <td>
                {item.taggings && item.taggings.map(tagging => (
                  <button 
                    key={tagging.tag.tagId} 
                    type="button" 
                    className='btn btn-link p-0 me-1 align-baseline btn-sm' 
                    onClick={() => (selectTag(tagging.tag.tagId))}>
                    {tagging.tag.name}
                  </button> 
                ))}
                </td>

                <td><Link to={"/bookmarks/" + item.bookmarkId}>Details&hellip;</Link></td>
              </tr>
            )
          })}
        </tbody>
    }

    return (
      <Row>
        <Col lg={2}>
          {filterDialog}
        </Col>
        <Col>
          <Row>
            {pageControl}
          </Row>
          <Table>
            <thead>
              <tr>
                <th></th>
                <th className="d-none d-lg-table-cell">Owner</th>
                <th>Tags</th>
                <th></th>
              </tr>
            </thead>
            {tableBody}
          </Table>
          <Row>
            {pageControl}
          </Row>
        </Col>
      </Row>
    );
}

export default AllBookmarks;