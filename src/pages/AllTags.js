import React, { useState, useEffect } from 'react';
import { Row, Col, Table } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';

import TagsFilterDialog from '../TagsFilterDialog';
import PageControl from '../PageControl';
import ErrorLoginRedirect from '../ErrorLoginRedirect';
import { checkForError } from '../FetchUtil';

function AllTags() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    let [searchParams, setSearchParams] = useSearchParams();
    const [needToApplyChanges, setNeedToApplyChanges] = useState(true);

    function handleFilterChange(newFilterProps) {
      setSearchParams(new URLSearchParams(newFilterProps));
      setNeedToApplyChanges(true);
    }

    function handlePageChange(newPage) {
      searchParams.set("page", newPage);
      setSearchParams(searchParams);
      setNeedToApplyChanges(true);
    }

    const filterDialog = <TagsFilterDialog onFilterApply={handleFilterChange} />;
    const pageControl = <PageControl pageData={items} onPageChange={handlePageChange} />;
  
    useEffect(() => {
      if (!needToApplyChanges) {
        return;
      }

      fetch("/api/tags?" + searchParams.toString(), {
        method:'GET',
      })
        .then(res => checkForError(res))
        .then(res => res.json())
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

            let bookmarkLink = "/bookmarks/?tagIds=" + item.tagId;
            if (groupId && groupId > 0) {
              bookmarkLink += "&groupId=" + groupId;
            }

            let creatorLink = "/tags/?groupId=" + groupId + "&creatorId=" + item.creator.userId;
            let creatorLinkComponent = <>{item.creator.username}</>;
            if (groupId && groupId > 0) {
              creatorLinkComponent = <Link to={creatorLink}>{item.creator.username}</Link>;
            }

            return (
              <tr key={item.tagId}>
                <td>{item.name}</td>  
                <td className="d-none d-lg-table-cell">{creatorLinkComponent}</td>
                <td><Link to={bookmarkLink}>Tagged bookmarks&hellip;</Link></td>
                <td><Link to={"/tags/" + item.tagId}>Details&hellip;</Link></td>
              </tr>
            );
          })}
        </tbody>;
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
                <th>Title</th>
                <th className="d-none d-lg-table-cell">Owner</th>
                <th></th>
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
  
export default AllTags;