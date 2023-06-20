import React, { useState, useEffect, useContext, useCallback } from 'react';
import GlobalContext from "../GlobalContext";
import { CSSTransition } from 'react-transition-group';
import { searchPublicChannel } from "../Firebase";
import '../scss/ChannelSearchModal.scss';

function SearchResults({ keyword }) {
    const [results, setResults] = useState([]);

    async function getResults() {
        if (!keyword) return;
        const res = await searchPublicChannel({ keyword }).then((res) => res).catch((err) => { console.log(err); });
        setResults(res.data);
    }

    useEffect(() => {
        getResults();
    }, [keyword]);

    const resultList = results.map((result) => {
        return (
            <div className="searchItem" key={result.id}>
                <div className="imgBox"></div>
                <div className="info">{result.info.title}</div>
                <button className="enterBtn">
                    <span className="material-icons">arrow_forward</span>
                </button>
            </div>
        );
    });

    return (
        <div className="searchResults">
            {resultList}
        </div>
    );
}

function ChannelSearchModal({ isOpen, setIsOpen }) {
    const nodeRef = React.useRef(null);
    const [inputKeyword, setInputKeyword] = useState('');
    const [keyword, setKeyword] = useState('');

    function handleSearch() {
        setKeyword(inputKeyword);
        setInputKeyword('');
    }

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
                        <form action="" className="form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="channelName"
                                    placeholder="Enter channel name"
                                    value={inputKeyword}
                                    onChange={(e) => setInputKeyword(e.target.value)}
                                />
                                <button className="searchBtn" onClick={() => handleSearch()}>
                                    <span className="material-icons">search</span>
                                </button>
                            </div>
                            <SearchResults keyword={keyword} />
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </CSSTransition>
    );
}

export default ChannelSearchModal;