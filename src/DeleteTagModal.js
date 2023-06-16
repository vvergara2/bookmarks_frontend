import React, { useState } from 'react';
import { checkForError } from './FetchUtil';
import ModalButton from './ModalButton';

function DeleteTagModal(props) {
    const tag = props.tag;
    const onSuccess = props.onSuccess;
    const onError = props.onError;
    const className = props.className;

    const onConfirm = () => {
        fetch("/api/tags/" + tag.tagId, {
            method:'DELETE',
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(res => checkForError(res))
            .then(() => {
                onSuccess();
            })
            .catch((error) => {
                onError(error);
            });
    }

    return (
        <ModalButton
            onConfirm={onConfirm}
            title="Delete tag"
            bodyText="Are you sure you want to delete this tag?"
            confirmMessage="Delete"
            className={className}
        />
    )

}

export default DeleteTagModal;