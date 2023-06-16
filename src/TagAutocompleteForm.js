import React, { useState, useEffect, useContext, useRef } from 'react';
import { getSavedTagCache, saveTagCache } from './LocalTagCache';
import { Dropdown } from 'react-bootstrap';

function TagAutocompleteForm(props) {
    const AUTOCOMPLETE_TIMEOUT_MS = 300;

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [matches, setMatches] = useState([]);
    const [inputHasFocus, setInputHasFocus] = useState(false);
    const [inputText, setInputText] = useState("");
    const tagCache = getSavedTagCache;
    const fetchTimeout = useRef(null);

    useEffect(() => {
        if (fetchTimeout.current != null) {
            clearTimeout(fetchTimeout.current);
            fetchTimeout.current = null;
        }
        
        if (!inputText || inputText.length == 0) {
            setMatches([]);
            return;
        }

        let reqUrl = "/api/tags?search=" + encodeURIComponent(inputText);
        if (props.groupId) {
            reqUrl += "&groupId=" + props.groupId;
        }
        
        fetchTimeout.current = setTimeout(() => {fetch(
            reqUrl,
            {
                method: "GET"
            }
        ).then(res => {
            fetchTimeout.current = null;

            if (!res.ok) {
              return Promise.reject(new Error(res.statusText));
            }
    
            return res.json();
        }).then(
            (result) => {
                if (props.allowNewTag) {
                    result.content.unshift({
                        "tagId": -1,
                        "name": "Create new tag"
                    });
                } else if (result.content.length == 0) {
                    setMatches([]);
                    return;
                }

                const tagsElems = result.content.map((tag) => 
                    <Dropdown.Item href="#" key={tag.tagId} onClick={() => {handleTagClick(tag)}}>
                        {tag.name}
                    </Dropdown.Item>
                );
                setMatches(tagsElems);
            },
            (error) => {
                setError(error);
            }
        )}, AUTOCOMPLETE_TIMEOUT_MS);
    }, [inputText]);

    const inputElem = <input id="tagFilterInput" data-bs-toggle="dropdown" type="text" className='form-select-sm form-control'
        onChange={(e) => (setInputText(e.target.value))} value={inputText} placeholder='Start typing'></input>;
    const menuElem = <Dropdown.Menu show={inputText.length > 0 && matches.length > 0}>{matches}</Dropdown.Menu>;

    const handleTagClick = (tagData) => {
        if (props.allowNewTag && tagData.tagId == -1) {
            tagData.name = inputText;
        } else {
            // commit chosen tag to local tag cache
            tagCache[tagData.tagId] = tagData;
            saveTagCache(tagCache);
        }
        props.onTagSelection(tagData);
        resetInput();
    }

    const resetInput = () => {
        setInputText("");
    }

    return (
        <div className=''>
            {inputElem}
            {menuElem}
        </div>
    );
}

export default TagAutocompleteForm;