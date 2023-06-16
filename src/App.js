import React, { useState, useEffect, useContext } from 'react';
import { Route, Routes, Link, BrowserRouter, Navigate, NavLink, useLocation } from "react-router-dom"
import './App.css';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Button } from 'react-bootstrap';

import NewBookmarkForm from './pages/NewBookmarkForm';
import AllBookmarks from './pages/AllBookmarks';
import AllTags from './pages/AllTags';
import UpdateBookmarkForm from './pages/UpdateBookmarkForm';
import BookmarkDetails from './pages/BookmarkDetails';
import TagDetails from './pages/TagDetails';
import UpdateTagForm from './pages/UpdateTagForm';
import LoginForm from './pages/LoginForm';
import VerifyUserForm from './pages/VerifyUserForm';
import RegisterUserForm from './pages/RegisterUserForm';
import LoggedInUserGroups from './pages/LoggedInUserGroups';
import ResetPasswordRequestForm from './pages/ResetPasswordRequestForm';
import ResetPasswordForm from './pages/ResetPasswordForm';
import ManageGroupUsers from './pages/ManageGroupUsers';

import { UserDetailsContext } from './UserDetailsContext';
import { deleteTagCache } from './LocalTagCache';

function AppNavbar() {
  const {
    userDetails, 
    setUserDetailsNeedsUpdate, 
    setUserLoggingOut
  } = useContext(UserDetailsContext);

  const location  = useLocation();

  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/bookmarks">Bookmarks</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" activeKey={location.pathname}>
          {userDetails.userId === null &&
            <Nav.Item>
              <Nav.Link as={NavLink} eventKey="login" to="/login">Log in</Nav.Link>
            </Nav.Item>
          }
          {userDetails.username &&
            <>
            <Nav.Item>
              <Nav.Link as={NavLink} eventKey="bookmarks" to="/bookmarks">Bookmarks</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} eventKey="tags" to="/tags" >Tags</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} eventKey="groups" to="/groups" >Your groups</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} eventKey="newBookmarks" to="/bookmarks/new" >New bookmark&hellip;</Nav.Link>
            </Nav.Item>
            </>
          }
          </Nav>
          {userDetails.username &&
            <>
            <Button variant="link" onClick={() => {setUserLoggingOut(true)}}>
              Log out
            </Button>
            {userDetails.username} (User ID: {userDetails.userId})     
            </>
                  
          }
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function App() {
  const [userDetailsNeedsUpdate, setUserDetailsNeedsUpdate] = useState(true);
  const [userDetails, setUserDetails] = useState({
    username: null,
    userId: null,
  });
  const [userLoggingOut, setUserLoggingOut] = useState(false);

  useEffect(() => {
    if (userLoggingOut) {
      setUserLoggingOut(false);

      deleteTagCache();
      fetch("/api/logout").then(
        (result) => {
          setUserDetailsNeedsUpdate(true);
        },
        (error) => {
          setUserDetailsNeedsUpdate(true);
        }
      )
    }
  }, [userLoggingOut, userDetails]);

  useEffect(() => {
    if (userDetailsNeedsUpdate) {
      setUserDetailsNeedsUpdate(false);

      fetch("/api/users/me").then(res => res.json()).then(
        (result) => {
          if (result.userId) {
            setUserDetails(result);
          } else {
            setUserDetails({
              username: null,
              userId: null,
            });
          }
        },
        (error) => {
          setUserDetails({
            username: null,
            userId: null,
          });
        }
      );
    }
  }, [userDetailsNeedsUpdate]);
  
  return (
    <UserDetailsContext.Provider value={{userDetails, setUserDetailsNeedsUpdate, setUserLoggingOut}}>
    <BrowserRouter>
      <Container className="App">
        {userLoggingOut && 
          <Navigate to="/login" />
        }
        <Row className="mb-3">
          <Col>
            <AppNavbar />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Routes>
              <Route path="/" element={<Navigate to="/bookmarks" />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/verify_user" element={<VerifyUserForm />} />
              <Route path="/register_user" element={<RegisterUserForm />} />
              <Route path="/reset_password_request" element={<ResetPasswordRequestForm />} />
              <Route path="/reset_password" element={<ResetPasswordForm />} />
              <Route path="/bookmarks">
                <Route index element={<AllBookmarks />} />
                <Route path=":bookmarkId" element={<BookmarkDetails />} />
                <Route path=":bookmarkId/update" element={<UpdateBookmarkForm />} />
                <Route path="new" element={<NewBookmarkForm />} />
              </Route>
              <Route path="/tags">
                <Route index element={<AllTags />} />
                <Route path=":tagId" element={<TagDetails />} />
                <Route path=":tagId/update" element={<UpdateTagForm />} />
              </Route>
              <Route path="/groups" element={<LoggedInUserGroups />} />
              <Route path="/manage_group" element={<ManageGroupUsers />} />
            </Routes>
          </Col>
        </Row>
      </Container>
    </BrowserRouter>
    </UserDetailsContext.Provider>
  );
}

export default App;
