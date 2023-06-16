import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

function ModalButton(props) {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    const onConfirm = props.onConfirm;
    const disabled = props.disabled;
    const title = props.title;
    const bodyText = props.bodyText;
    const confirmMessage = props.confirmMessage;
    const className = props.className;

    const confirm = () => {
        onConfirm();
        setShowModal(false);
    }

    return (
        <>
        <button 
            type="button" 
            className={className} 
            disabled={disabled}
            onClick={handleShow}>
            {title}&hellip;
        </button>
        <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{bodyText}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                Cancel
                </Button>
                <Button variant="primary" onClick={confirm}>
                {confirmMessage}
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    )
}

ModalButton.defaultProps = {
    disabled: false,
    bodyText: "Are you sure?",
    confirmMessage: "Confirm",
    className: "btn btn-outline-danger",
}

export default ModalButton;