import React, { useState, useEffect, useContext, useCallback } from 'react';
import GlobalContext from "../GlobalContext";
import { CSSTransition } from 'react-transition-group';
import { handleCRUDReq } from "../Firebase";
import '../scss/ChannelSearchModal.scss';

function SearchResults({ keyword }) {
    const [results, setResults] = useState([]);

    async function getResults() {
        // const res = await handleCRUDReq('get', '');
        // setResults(res);
    }

    useEffect(() => {
        // fetch data
    }, [keyword]);

    return (
        <div className="search-results">
            <div className="search-result">
                <div className="search-result__avatar"></div>
                <div className="search-result__info">
                    <div className="search-result__name">Channel name</div>
                    <div className="search-result__description">Channel description</div>
                </div>
            </div>
        </div>
    );
}

function ChannelSearchModal({ isOpen, setIsOpen }) {
    const nodeRef = React.useRef(null);
    return (
        <CSSTransition
            in={isOpen}
            timeout={500}
            classNames="modal-fade"
            nodeRef={nodeRef}
            unmountOnExit
        >
        <div className="modal" tabIndex="-1" ref={nodeRef}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Search channel</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsOpen(false)}></button>
                    </div>
                    <div className="modal-body">
                        <form action="" className="form">
                            <div className="form-group">
                                <input type="text" className="form-control" id="channelName" placeholder="Enter channel name" />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </CSSTransition>
    );
}

export default ChannelSearchModal;