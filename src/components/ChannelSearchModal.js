import { Link } from "react-router-dom";
import React, { useState, useEffect, useContext, useCallback } from 'react';
import GlobalContext from "../GlobalContext";
import { CSSTransition } from 'react-transition-group';
import { searchPublicChannel } from "../Firebase";
import { ReactComponent as LoadingIcon } from "../images/loading_s.svg";
import '../scss/ChannelSearchModal.scss';

function SearchResults({ keyword, setKeyword, setIsOpen, getPersonalChannel }) {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { state, dispatch } = useContext(GlobalContext);

    const pushErrorMsg = useCallback((msg) => {
        const id = Date.now();
        dispatch({
            type: "setToastList",
            payload: {
                action: "add",
                title: "搜尋失敗",
                content: msg,
                theme: "error",
                id,
            },
        });
        setTimeout(() => {
            dispatch({
                type: "setToastList",
                payload: {
                    action: "delete",
                    id,
                },
            });
        }, 3000);
    }, [dispatch]);

    async function getResults() {
        if (!keyword) return;
        setIsLoading(true);
        const res = await searchPublicChannel({ keyword }).then((res) => res).catch((err) => { console.log(err); });
        setIsLoading(false);
        if (!res) return;
        if (res.data.length === 0) return pushErrorMsg("查無結果");
        setResults(res.data);
        setKeyword('');
    }

    useEffect(() => {
        if (!keyword) return;
        getResults();
    }, [keyword]);

    useEffect(() => {
        return () => {
            setResults([]);
        };
    }, []);

    const loadingEl = (
        isLoading &&
        <div className="searchItem loadingSmall">
            <span>Loading</span>
            <LoadingIcon />
        </div>
    );

    const resultList = results.map((result) => {
        return (
            <div className="searchItem" key={result.id}>
                <Link to={`/channel/${result.id}`} className="link" onClick={() => {
                    setIsOpen(false);
                    setKeyword('');
                }}>
                    {result.info.photoURL && 
                        <div className="imgBox">
                            <img src={result.info.photoURL} alt="channel" />
                        </div>
                    }
                    <div className="info">{result.info.title}</div>
                    <button className="enterBtn">
                        <span className="material-icons">arrow_forward</span>
                    </button>
                </Link>
            </div>
        );
    });

    return (
        <div className="searchResults">
            {loadingEl}
            {resultList}
        </div>
    );
}

function ChannelSearchModal({ isOpen, setIsOpen }) {
    const { state, dispatch } = useContext(GlobalContext);
    const nodeRef = React.useRef(null);
    const [inputKeyword, setInputKeyword] = useState('');
    const [keyword, setKeyword] = useState('');

    const pushErrorMsg = useCallback((msg) => {
        const id = Date.now();
        dispatch({
            type: "setToastList",
            payload: {
                action: "add",
                title: "發生錯誤",
                content: msg,
                theme: "error",
                id,
            },
        });
        setTimeout(() => {
            dispatch({
                type: "setToastList",
                payload: {
                    action: "delete",
                    id,
                },
            });
        }, 3000);
    }, [dispatch]);

    function handleSearch() {
        if (!inputKeyword) {
            pushErrorMsg("請輸入關鍵字");
            return;
        }
        setKeyword(inputKeyword);
        setInputKeyword('');
    }

    useEffect(() => {
        if (isOpen) {
            setKeyword('');
            setInputKeyword('');
        }
        return () => {
            setKeyword('');
            setInputKeyword('');
        };  
    }, [isOpen]);

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
                        <h5 className="modal-title">搜尋頻道</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsOpen(false)}></button>
                    </div>
                    <div className="modal-body">
                        <form action="" className="form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="channelName"
                                    placeholder="輸入頻道名稱"
                                    value={inputKeyword}
                                    onChange={(e) => setInputKeyword(e.target.value)}
                                />
                                <button className="searchBtn" onClick={() => handleSearch()}>
                                    <span className="material-icons">search</span>
                                </button>
                            </div>
                            <SearchResults 
                                keyword={keyword} 
                                setKeyword={setKeyword} 
                                setIsOpen={setIsOpen}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </CSSTransition>
    );
}

export default ChannelSearchModal;