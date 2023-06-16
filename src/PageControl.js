import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

function PageControl(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [pageNumber, setPageNumber] = useState(1); // display only
    const [inputText, setInputText] = useState(1); // raw input contents
    const { register, setValue, handleSubmit, watch, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (isNaN(props.pageData.number)) {
            return;
        }

        setInputText(props.pageData.number + 1);
    }, [props.pageData])

    const handlePageSelection = event => {
        let num = parseInt(inputText);
        if (isNaN(num)) {
            setInputText(pageNumber);
            return;
        }

        if (num > props.pageData.totalPages) {
            num = props.pageData.totalPages;
        } else if (num < 1) {
            num = 1;
        }

        // send page up
        props.onPageChange(num - 1);
        setPageNumber(num);
    }

    // receives 0-indexed page number!
    const goToPage = (num) => {
        if (num < 0 || num > props.pageData.totalPages - 1) {
            return;
        } 

        // send page up
        props.onPageChange(num);
        setPageNumber(num + 1);
    }

    return (
        <div className="row justify-content-center mb-2 mt-2">
            <div className="col-auto">
                <Button className="btn btn-sm btn-dark" disabled={props.pageData.number == 0} onClick={() => (goToPage(0))}>&laquo;</Button>
            </div>
            <div className="col-auto">
                <Button className="btn btn-sm btn-dark" disabled={props.pageData.number == 0} onClick={() => (goToPage(props.pageData.number - 1))}>&lt;</Button>
            </div>
            <div className="col-2">
                <input 
                    className="form-control form-control-sm"
                    type="number"
                    onChange={(e) => (setInputText(e.target.value))} 
                    value={inputText}>
                </input>
            </div>
            <div className="col-auto">
                <Button className="btn btn-sm btn-dark" onClick={handlePageSelection}>Go</Button> 
            </div>
            <div className="col-auto">
                <Button className="btn btn-sm btn-dark" disabled={props.pageData.number == props.pageData.totalPages - 1} onClick={() => (goToPage(props.pageData.number + 1))}>&gt;</Button>
            </div>
            <div className="col-auto">
                <Button className="btn btn-sm btn-dark" disabled={props.pageData.number == props.pageData.totalPages - 1} onClick={() => (goToPage(props.pageData.totalPages - 1))}>&raquo;</Button>
            </div>
            <div className="col-4">
                <small className="align-middle">Displaying results {(props.pageData.number) * (props.pageData.size) + 1}-{(props.pageData.number) * (props.pageData.size) + props.pageData.numberOfElements}  of {props.pageData.totalElements}</small> 
            </div>
        </div>
    )
}

export default PageControl;