import React, { useState } from 'react';
import ModalButton from './ModalButton';
import { checkForError } from './FetchUtil';

function DeleteBookmarkModal(props) {
    const bookmark = props.bookmark;
    const onSuccess = props.onSuccess;
    const onError = props.onError;
    const className = props.className;

    const onConfirm = () => {
        fetch("/api/bookmarks/" + bookmark.bookmarkId, {
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
            title="Delete bookmark"
            bodyText="Are you sure you want to delete this bookmark?"
            confirmMessage="Delete"
            className={className}
        />
    )

}

export default DeleteBookmarkModal;