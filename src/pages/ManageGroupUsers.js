import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Form, Alert } from 'react-bootstrap';
import { useForm } from "react-hook-form";
import { useSearchParams, Link, Navigate } from 'react-router-dom';

import ErrorLoginRedirect from '../ErrorLoginRedirect';
import { checkForError } from '../FetchUtil';
import ModalButton from '../ModalButton';

function ManageGroupUsers() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [leftGroup, setLeftGroup] = useState(false);

    const [privsUpdateSuccess, setPrivsUpdateSuccess] = useState(false);
    const [privsUpdateError, setPrivsUpdateError] = useState(null);
    
    const [groupUsersNeedsUpdate, setGroupUsersNeedsUpdate] = useState(true);
    const [groupUsers, setGroupUsers] = useState([]);

    const [pendingGroupUsersNeedsUpdate, setPendingGroupUsersNeedsUpdate] = useState(true);
    const [pendingGroupUsers, setPendingGroupUsers] = useState([]);
    const [pendingGroupUsersError, setPendingGroupUsersError] = useState(null);

    const [loggedInGroupUser, setLoggedInGroupUser] = useState(null);
    const [groupData, setGroupData] = useState({});
    
    let [searchParams] = useSearchParams();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { register: registerInvite, reset: resetInvite, handleSubmit: handleInviteSubmit, formState: { errors: errorsInvite } } = useForm();
    const { register: registerLeave, handleSubmit: handleLeaveSubmit, formState: { errors: errorsLeave } } = useForm();
    
    useEffect(() => {
        if (!pendingGroupUsersNeedsUpdate) {
            return;
        }

        fetch("/api/groupusers/group/" + searchParams.get("groupId") + "?pending=true", {
            method: 'GET'
        })
            .then(res => checkForError(res))
            .then(res => res.json())
            .then((items) => {
                setPendingGroupUsers(items);
                setPendingGroupUsersNeedsUpdate(false);
                setPendingGroupUsersError(null);
            })
            .catch((error) => {
                setPendingGroupUsersError(error);
            });
    }, [pendingGroupUsersNeedsUpdate]);

    useEffect(() => {
        if (!groupUsersNeedsUpdate) {
            return;
        }

        fetch("/api/groupusers/group/" + searchParams.get("groupId"), {method:'GET'})
            .then(res => checkForError(res))
            .then(res => res.json())
            .then((items) => {
                setGroupUsers(items);
                setGroupUsersNeedsUpdate(false);
            }) 
            .catch((error) => {
                setError(error);
            });
    }, [groupUsersNeedsUpdate]);

    useEffect(() => {
        fetch("/api/groupusers/me", {method:'GET'})
            .then(res => checkForError(res))
            .then(res => res.json())
            .then((items) => {
                items.forEach(groupUser => {
                    if (groupUser.group.groupId == searchParams.get("groupId")) {
                        setLoggedInGroupUser(groupUser);
                    }
                })
            })
            .catch(error => {
                setError(error);
            });

        fetch("/api/groups/" + searchParams.get("groupId"), {method:'GET'})
            .then(res => checkForError(res))
            .then(res => res.json())
            .then((items) => {
                setIsLoaded(true);
                setGroupData(items);
            })
            .catch(error => {
                setError(error);
            });
    }, []);

    const onSubmitPrivs = data => {
        let groupedData = {}; // form data keyed by userId
        let finalData = []; // array of objects which correspond to GroupUserUpdateDTO objects on the server side

        setPrivsUpdateSuccess(false);

        for (const [key, value] of Object.entries(data)) {
            let splitKey = key.split("_");
            if (!(splitKey[0] in groupedData)) {
                groupedData[splitKey[0]] = {};
            }

            if (!("userId" in groupedData[splitKey[0]])) {
                groupedData[splitKey[0]]["userId"] = parseInt(splitKey[0]);
            }

            if (!("groupId" in groupedData[splitKey[0]])) {
                groupedData[splitKey[0]]["groupId"] = parseInt(searchParams.get("groupId"));
            }

            groupedData[splitKey[0]][splitKey[1]] = value;
        }

        for (const [key, value] of Object.entries(groupedData)) {
            finalData.push(value);
        }

        fetch("/api/groupusers/bulkupdate", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"groupUserUpdateList": finalData})
        })
            .then(res => checkForError(res))
            .then(() => {
                setPrivsUpdateSuccess(true);
                setPrivsUpdateError(null);
            })
            .catch((error) => {
                setPrivsUpdateError(error);
            });
    }

    const onSubmitInvite = data => {
        fetch("/api/groupusers/invite?groupId=" + searchParams.get("groupId") + "&recipientId=" + data.userId, {
            method: "POST",
        })
            .then(res => checkForError(res))
            .then(() => {
                setPendingGroupUsersNeedsUpdate(true);
                resetInvite();
            });
    }

    const onSubmitLeave = data => {
        fetch("/api/groupusers/leavegroup?groupId=" + searchParams.get("groupId") + "&successorId=" + data.successorId, {
            method: "POST",
        })
            .then(res => checkForError(res))
            .then(() => {
                setLeftGroup(true);
            });
    }

    const rescindInvite = (groupUser) => {
        fetch("/api/groupusers/rescindinvite?groupId=" + groupUser.group.groupId + "&recipientId=" + groupUser.user.userId, {
            method: "POST",
        })
            .then(res => checkForError(res))
            .then(() => {
                setPendingGroupUsersNeedsUpdate(true);
            });
    }

    const removeUser = (groupUser) => {
        fetch("/api/groupusers/removeuser?groupId=" + groupUser.group.groupId + "&removeUserId=" + groupUser.user.userId, {
            method: "POST",
        })
            .then(res => checkForError(res))
            .then(() => {
                setGroupUsersNeedsUpdate(true);
            });
    }

    const userIsOwner = (userData, groupData) => {
        if (!groupData) {
            return false;
        }

        if (!userData) {
            return false;
        }

        if (groupData.owner.userId === userData.user.userId) {
            return true;
        }

        return false;
    }

    if (!searchParams.get("groupId")) {
        return <Navigate to="/groups" />;
    }

    if (!isLoaded || !loggedInGroupUser) {
        return <h3>Loading&hellip;</h3>
    }

    return (

    <>
    <ErrorLoginRedirect error={error} />

    {leftGroup &&
        <Navigate to="/groups" />
    }

    <h3>Manage group "{groupData.name}"</h3>

    <Row className="mb-3 mt-3">
        <div className="col-auto">
            <Form onSubmit={handleInviteSubmit(onSubmitInvite)}>
                <Form.Label>Invite user to group</Form.Label>
                <Form.Control 
                    className="mb-2" 
                    type="text" 
                    label="Invite user" placeholder='User ID' {...registerInvite("userId")} />
                <div className="text-end">
                    <Button 
                        className="mb-2 btn btn-sm" 
                        variant="outline-primary" 
                        type="submit" 
                        disabled={!loggedInGroupUser.canInviteUsers}>
                        Send invite
                    </Button>
                </div>
            </Form>
        </div>

        <div className="col-auto">
            <Form>
                <Form.Label>Leave group</Form.Label>
                <Form.Control 
                    className="mb-2" 
                    type="text" 
                    placeholder='Successor user ID (if owner)' {...registerLeave("successorId")} />
                <div className="text-end">
                    <ModalButton 
                        className="mb-2 btn btn-outline-danger btn-sm" 
                        bodyText={"Are you sure you want to leave group " + groupData.name + "?"}
                        title="Leave group"
                        confirmMessage="Leave group"
                        onConfirm={handleLeaveSubmit(onSubmitLeave)} />
                </div>
            </Form>
        </div>

    </Row>
    
    <Row>
        <Col>
            <h5>Pending invites</h5>
            <Table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                {pendingGroupUsersError && 
                    <tr>
                        <td>{pendingGroupUsersError.message}</td>
                    </tr>
                }
                {!pendingGroupUsersError && pendingGroupUsers.length === 0 &&
                    <tr>
                        <td>There are no pending group users.</td>
                    </tr>
                } 
                {pendingGroupUsers.map(groupUser => (
                    <tr key={groupUser.user.userId}>
                        <td>
                            {groupUser.user.username}
                        </td>
                        <td>
                            <Button 
                                variant="outline-danger"
                                className="btn btn-sm"
                                onClick={() => (rescindInvite(groupUser))}>
                                Rescind invite
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Col>
    </Row>

    <Row>
        <Col>

        <h5>Active group members</h5>

        { privsUpdateSuccess && 
            <Alert variant="success">Group user privileges successfully updated.</Alert>
        }

        { privsUpdateError && 
            <Alert variant="danger">Error: {privsUpdateError.message}</Alert>
        }

        <Form onSubmit={handleSubmit(onSubmitPrivs)}>
            <Table>
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Join date</th>
                    <th>Permissions</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
            {groupUsers.map(groupUser => (
                <tr key={groupUser.user.userId}>
                    <td>{groupUser.user.userId}</td>
                    <td>
                        <Link to={`/bookmarks/?groupId=${groupUser.group.groupId}&creatorId=${groupUser.user.userId}`}>
                            {groupUser.user.username}
                        </Link>
                        {loggedInGroupUser.user.userId == groupUser.user.userId && <small> (You)</small>}
                    </td>
                    <td>{(new Date(groupUser.joinDate)).toLocaleString()}</td>
                    <td>
                        <Form.Check label="Can add bookmarks"
                            disabled={loggedInGroupUser.user.userId == groupUser.user.userId || !loggedInGroupUser.canGrantAddBookmarksPermission}
                            defaultChecked={groupUser.canAddBookmarks} 
                            {...register(`${groupUser.user.userId}_canAddBookmarks`)} 
                        />
                        <Form.Check label="Can remove bookmarks"
                            disabled={loggedInGroupUser.user.userId == groupUser.user.userId || !loggedInGroupUser.canGrantRemoveBookmarksPermission}
                            defaultChecked={groupUser.canRemoveBookmarks} 
                            {...register(`${groupUser.user.userId}_canRemoveBookmarks`)} 
                        />
                        <Form.Check label="Can invite users"
                            disabled={loggedInGroupUser.user.userId == groupUser.user.userId || !loggedInGroupUser.canGrantInviteUsersPermission}
                            defaultChecked={groupUser.canInviteUsers} 
                            {...register(`${groupUser.user.userId}_canInviteUsers`)} 
                        />
                        <Form.Check label="Can remove users"
                            disabled={loggedInGroupUser.user.userId == groupUser.user.userId || !loggedInGroupUser.canGrantRemoveUsersPermission}
                            defaultChecked={groupUser.canRemoveUsers} 
                            {...register(`${groupUser.user.userId}_canRemoveUsers`)} 
                        />
                        <Form.Check label="Can grant add bookmarks permission"
                            disabled={loggedInGroupUser.user.userId == groupUser.user.userId || !userIsOwner(loggedInGroupUser, groupData)}
                            defaultChecked={groupUser.canGrantAddBookmarksPermission} 
                            {...register(`${groupUser.user.userId}_canGrantAddBookmarksPermission`)} 
                        />
                        <Form.Check label="Can grant remove bookmarks permission"
                            disabled={loggedInGroupUser.user.userId == groupUser.user.userId || !userIsOwner(loggedInGroupUser, groupData)}
                            defaultChecked={groupUser.canGrantRemoveBookmarksPermission} 
                            {...register(`${groupUser.user.userId}_canGrantRemoveBookmarksPermission`)} 
                        />
                        <Form.Check label="Can grant invite users permission"
                            disabled={loggedInGroupUser.user.userId == groupUser.user.userId || !userIsOwner(loggedInGroupUser, groupData)}
                            defaultChecked={groupUser.canGrantInviteUsersPermission} 
                            {...register(`${groupUser.user.userId}_canGrantInviteUsersPermission`)} 
                        />
                        <Form.Check label="Can grant remove users permission"
                            disabled={loggedInGroupUser.user.userId == groupUser.user.userId || !userIsOwner(loggedInGroupUser, groupData)}
                            defaultChecked={groupUser.canGrantRemoveUsersPermission} 
                            {...register(`${groupUser.user.userId}_canGrantRemoveUsersPermission`)} 
                        />
                    </td>
                    <td>
                        <ModalButton 
                            className="btn btn-outline-danger btn-sm" 
                            disabled={!loggedInGroupUser.canRemoveUsers || groupUser.user.userId == loggedInGroupUser.user.userId}
                            bodyText={"Are you sure you want to remove user " + groupUser.user.username + " from the group?"}
                            title="Remove user"
                            confirmMessage="Remove"
                            onConfirm={() => (removeUser(groupUser))} />
                    </td>
                </tr>
            ))}
            </tbody>
            </Table>
            <div className="text-end">
                <Button 
                    type="submit" >
                    Save changes
                </Button>
            </div>
        </Form>
        </Col>
    </Row>

    </>
    );
}

export default ManageGroupUsers;