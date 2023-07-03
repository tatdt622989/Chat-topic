import React, { useState, useEffect, useContext, useCallback } from 'react';
import GlobalContext from "../GlobalContext";
import { CSSTransition } from 'react-transition-group';
import { updateDbUserData } from "../Firebase";
import { ReactComponent as LoadingIcon } from "../images/loading_s.svg";
import '../scss/ChannelUserInfoModal.scss';
import imgToBase64 from "../utils/imgToBase64";

function ChannelUserInfoModal({ isOpen, setIsOpen }) {
    const { state, dispatch } = useContext(GlobalContext);
    const nodeRef = React.useRef(null);
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState("");
    const [userName, setUserName] = useState("");
    const [userDescription, setUserDescription] = useState("");
    const [userEmail, setUserEmail] = useState("");

    const handleFileChange = async (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            const url = await imgToBase64(e.target.files[0]);
            setFileUrl(url);
        }
    };

    const handleSave = useCallback(async () => {
        await updateDbUserData('edit', {
            name: userName,
            description: userDescription,
            photoURL: fileUrl,
            uid: state.userId
        });
        dispatch({
            type: 'setUserName',
            payload: userName
        });
        dispatch({
            type: 'setUserDescription',
            payload: userDescription
        });
        dispatch({
            type: 'setUserPhotoURL',
            payload: fileUrl
        });
        setIsOpen(false);
    }, [ userName, userDescription, fileUrl, dispatch, setIsOpen, state.userId ]);

    useEffect(() => {
        setUserName(state.userName);
        setUserDescription(state.userDescription);
        setFileUrl(state.userPhotoURL);
        setUserEmail(state.userEmail);
    }, [state.userName, state.userDescription, state.userPhotoURL, state.userEmail ]);

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
                            <h5 className="modal-title">個人資訊</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsOpen(false)}></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="mb-3">
                                    <div className="fileStyle-1">
                                        <label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            <div className="imgBox">
                                                {fileUrl ? (
                                                    <img src={fileUrl} alt="account" />
                                                ) : (
                                                    <span className="material-icons">account_circle</span>
                                                )}
                                                <div className="iconBox">
                                                    {fileUrl ? (
                                                        <span className="material-icons">edit</span>
                                                    ) : (
                                                        <span className="material-icons">add_a_photo</span>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">電子郵件</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder=""
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        readOnly
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">名稱</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder=""
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">描述</label>
                                    <textarea
                                        type="text"
                                        className="form-control"
                                        placeholder=""
                                        value={userDescription}
                                        onChange={(e) => setUserDescription(e.target.value)}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary cancelBtn" onClick={() => setIsOpen(false)}>取消</button>
                            <button type="button" className="btn btn-primary" onClick={handleSave}>存檔</button>
                        </div>
                    </div>
                </div>
            </div>
        </CSSTransition>
    )
}

export default ChannelUserInfoModal;