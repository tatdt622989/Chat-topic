import React, { useState, useEffect, useContext, useCallback } from 'react';
import GlobalContext from "../GlobalContext";
import { CSSTransition } from 'react-transition-group';
import '../scss/ChannelModal.scss';
import { CRUDRequest, auth } from "../Firebase";

function ChannelModal({ isOpen, setIsOpen, channelInfo, modalType, channelId }) {
    const nodeRef = React.useRef(null);
    // 全域資料及方法
    const { state, dispatch } = useContext(GlobalContext);
    const [channelTitle, setChannelTitle] = useState("");
    const [channelDescription, setChannelDescription] = useState("");
    const [channelPrivacy, setChannelPrivacy] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const pushErrorMsg = useCallback((msg) => {
        console.log("Entering pushErrorMsg"); // 在函式開頭新增這行
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
            console.log("setTimeout");
            dispatch({
                type: "setToastList",
                payload: {
                    action: "delete",
                    id,
                },
            });
        }, 3000);
        console.log("Exiting pushErrorMsg"); // 在函式結尾新增這行
    }, [dispatch]);

    const handleSave = async () => {
        console.log("handleSave");
        if (isLoading) return;
        if (!channelTitle.trim()) {
            pushErrorMsg("請輸入頻道名稱");
            return;
        }
        setIsLoading(true);
        if (modalType === "create") {
            const data = {
                info: {
                    title: channelTitle,
                    description: channelDescription,
                    privacy: channelPrivacy ? 'public' : 'private',
                    owner: auth.currentUser.uid,
                },
                members: {},
                messages: {},
            };
            const url = `/channels/${Date.now()}/`;
            const res = await CRUDRequest("push", url, data);
            if (res) {
                setIsOpen(false);
            } else {
                pushErrorMsg("新增失敗");
            }
        }
        if (modalType === "edit") {
            const data = {
                title: channelTitle,
                description: channelDescription,
                privacy: channelPrivacy,
            };
            const url = `/channels/${channelId}/info/`;
            const res = await CRUDRequest("update", url, data);
            if (res) {
                setIsOpen(false);
            } else {
                pushErrorMsg("更新失敗");
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (channelInfo) {
            setChannelTitle(channelInfo.title);
            setChannelDescription(channelInfo.description);
            setChannelPrivacy(channelInfo.privacy);
        }
    }, [channelInfo]);

    useEffect(() => {
        if (isOpen && modalType === "create") {
            setChannelTitle("");
            setChannelDescription("");
            setChannelPrivacy(false);
        }
        if (isOpen && modalType === "edit") {
            setChannelTitle(channelInfo.title);
            setChannelDescription(channelInfo.description);
            setChannelPrivacy(channelInfo.privacy);
        }
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
                            <h5 className="modal-title">頻道資訊</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => setIsOpen(false)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="mb-3 switch-group">
                                    <label className="form-label">是否公開</label>
                                    <input type="checkbox" id="privacySwitch" />
                                    <label htmlFor="privacySwitch" className="form-label switch"></label>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">頻道名稱</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder=""
                                        value={channelTitle}
                                        onChange={(e) => setChannelTitle(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">頻道描述</label>
                                    <textarea
                                        type="text"
                                        className="form-control"
                                        placeholder=""
                                        value={channelDescription}
                                        onChange={(e) => setChannelDescription(e.target.value)}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            {modalType === 'edit' && <button type="button" className="btn btn-danger deleteBtn">刪除</button>}
                            {/* <button type="button" className="btn btn-secondary cancelBtn">取消</button> */}
                            <button type="button" className="btn btn-primary" onClick={handleSave}>存檔</button>
                        </div>
                    </div>
                </div>
            </div>
        </CSSTransition>
    );
}

export default ChannelModal;