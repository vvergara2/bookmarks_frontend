import React, { useState, useEffect } from 'react';
import { Row, Table, Button, Form } from 'react-bootstrap';
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import ErrorLoginRedirect from '../ErrorLoginRedirect';
import { checkForError } from '../FetchUtil';

function LoggedInUserGroups() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [pendingGroupsNeedsUpdate, setPendingGroupsNeedsUpdate] = useState(true);
    const [pendingGroups, setPendingGroups] = useState([]);
    const [ignoredGroupsNeedsUpdate, setIgnoredGroupsNeedsUpdate] = useState(true);
    const [ignoredGroups, setIgnoredGroups] = useState([]);
    const [activeGroupsNeedsUpdate, setActiveGroupsNeedsUpdate] = useState(true);
    const [activeGroups, setActiveGroups] = useState([]);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
    useEffect(() => {
      if (!setActiveGroupsNeedsUpdate) {
        return;
      }

      fetch("/api/groupusers/me", {method:'GET'})
        .then(res => checkForError(res))
        .then(result => result.json())
        .then((result) => {
          setIsLoaded(true);
          setActiveGroups(result);
          setActiveGroupsNeedsUpdate(false);
        })
        .catch((error) => {
          setIsLoaded(true);
          setError(error);
        })
    }, [activeGroupsNeedsUpdate]);

    useEffect(() => {
      if (!setPendingGroupsNeedsUpdate) {
        return;
      }

      fetch("/api/groupusers/me?pending=true", {method:'GET'})
        .then(res => checkForError(res))
        .then((result) => result.json())
        .then((result) => {
          setPendingGroups(result);
          setPendingGroupsNeedsUpdate(false);
        })
        .catch((error) => {
          setError(error);
        })
    }, [pendingGroupsNeedsUpdate]);

    useEffect(() => {
      if (!setIgnoredGroupsNeedsUpdate) {
        return;
      }

      fetch("/api/groupusers/me?ignored=true&pending=true", {method:'GET'})
        .then(res => checkForError(res))
        .then(result => result.json())
        .then((result) => {
          setIgnoredGroups(result);
          setIgnoredGroupsNeedsUpdate(false);
        })
        .catch((error) => {
          setError(error);
        });
    }, [ignoredGroupsNeedsUpdate])

    const acceptInvite = (groupId) => {
      fetch("/api/groupusers/acceptinvite" + "?groupId=" + groupId, {
          method: "POST",
      })
        .then(res => checkForError(res))
        .then(() => {
          setActiveGroupsNeedsUpdate(true);
          setPendingGroupsNeedsUpdate(true);
        })
        .catch((error) => {
          setError(error);
        });
    }

    const denyInvite = (groupId) => {
        fetch("/api/groupusers/denyinvite" + "?groupId=" + groupId, {
            method: "POST",
        })
          .then(res => checkForError(res))
          .then(() => {
            setPendingGroupsNeedsUpdate(true);
          })
          .catch((error) => {
            setError(error);
          });
    }

    const ignoreInvite = (groupId) => {
      fetch("/api/groupusers/ignoreinvite" + "?groupId=" + groupId, {
          method: "POST",
      })
        .then(res => checkForError(res))
        .then(() => {
          setIgnoredGroupsNeedsUpdate(true);
          setPendingGroupsNeedsUpdate(true);
        })
        .catch((error) => {
          setError(error);
        });
    }
    const onSubmitNewGroup = data => {
      fetch("/api/groups", {method:'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
        .then(res => checkForError(res))
        .then(() => {
          setActiveGroupsNeedsUpdate(true);
          reset();
        })
        .catch((error) => {
          setError(error);
        });
    }
  

      return (
        <>
        <ErrorLoginRedirect error={error} />    
        
        <h5>Create new group</h5>
        <Row className="mb-3 mt-3">
            <div className="col-auto">
                <Form onSubmit={handleSubmit(onSubmitNewGroup)}>
                    <Form.Control 
                        className="mb-2" 
                        type="text" 
                        label="Create new group" placeholder='Group name' {...register("name")} />
                    <div className="text-end">
                        <Button 
                            className="mb-2 btn btn-sm" 
                            variant="outline-primary" 
                            type="submit">
                            Create new group
                        </Button>
                    </div>
                </Form>
            </div>
        </Row>

        <h5>Active group memberships</h5>
        <Table className="mb-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Join date</th>
              <th>Permissions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {activeGroupsNeedsUpdate && 
              <tr>
                <td>Loading&hellip;</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            }
            {!activeGroupsNeedsUpdate && activeGroups.length == 0 && 
              <tr>
                <td>No group memberships.</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            }
            {activeGroups.map(groupUser => (
              <tr key={groupUser.group.groupId}>
                <td>
                  <Link to={`/bookmarks/?groupId=${groupUser.group.groupId}&creatorId=${groupUser.user.userId}`}>
                    {groupUser.group.name}
                  </Link>
                </td>
                <td>{(new Date(groupUser.joinDate)).toLocaleString()}</td>
                <td>
                    {groupUser.canAddBookmarks && <span>Add bookmarks<br/></span>}
                    {groupUser.canRemoveBookmarks && <span>Remove bookmarks<br/></span>}
                    {groupUser.canInviteUsers && <span>Invite users<br/></span>}
                    {groupUser.canRemoveUsers && <span>Remove users<br/></span>}
                    {groupUser.canGrantAddBookmarksPermission && <span>Can grant add bookmarks permission<br/></span>}
                    {groupUser.canGrantRemoveBookmarksPermission && <span>Can grant remove bookmarks permission<br/></span>}
                    {groupUser.canGrantInviteUsersPermission && <span>Can grant invite users permission<br/></span>}
                    {groupUser.canGrantRemoveUsersPermission && <span>Can grant remove users permission<br/></span>}
                </td>
                <td><Link to={"/manage_group?groupId=" + groupUser.group.groupId}>Details&hellip;</Link></td>
              </tr>
            ))}
          </tbody>
        </Table>
        <h5>Group invites</h5>
        <Table className="mb-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Invite sent date</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pendingGroupsNeedsUpdate && 
              <tr>
                <td>Loading&hellip;</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            }
            {!pendingGroupsNeedsUpdate && pendingGroups.length == 0 && 
              <tr>
                <td>No pending group invites.</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            }
            {pendingGroups.map(groupUser => (
              <tr key={groupUser.group.groupId}>
                <td>{groupUser.group.name}</td>
                <td>{groupUser.joinDate}</td>
                <td><Button onClick={() => (acceptInvite(groupUser.group.groupId))}>Accept invite</Button></td>
                <td><Button onClick={() => (denyInvite(groupUser.group.groupId))}>Reject invite</Button></td>
                <td><Button onClick={() => (ignoreInvite(groupUser.group.groupId))}>Ignore invite</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
        <h5>Ignored group invites</h5>
        <Table className="mb-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Invite sent date</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ignoredGroupsNeedsUpdate && 
              <tr>
                <td>Loading&hellip;</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            }
            {!ignoredGroupsNeedsUpdate && ignoredGroups.length == 0 && 
              <tr>
                <td>No ignored group invites.</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            }
            {ignoredGroups.map(groupUser => (
              <tr key={groupUser.group.groupId}>
                <td>{groupUser.group.name}</td>
                <td>{groupUser.joinDate}</td>
                <td><Button onClick={() => (acceptInvite(groupUser.group.groupId))}>Accept invite</Button></td>
                <td><Button onClick={() => (denyInvite(groupUser.group.groupId))}>Reject invite</Button></td>
                <td><Button onClick={() => (ignoreInvite(groupUser.group.groupId))}>Ignore invite</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
        </>
      );
}

export default LoggedInUserGroups;