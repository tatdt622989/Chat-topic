import React, { useState, useEffect, useContext, useCallback } from 'react';
import GlobalContext from "../GlobalContext";
import { CSSTransition } from 'react-transition-group';
import '../scss/ChannelModal.scss';
import { CRUDRequest, auth } from "../Firebase";

function MemberList({ members, setTempMembers }) {
    function handleRemoveMember(uid) {
        setTempMembers(members.filter((item) => item.uid !== uid));
    }

    const listItems = members.map((user) => (
        <li key={user.uid}>
            <div className="item">
                <div className="imgBox">
                    <img src={user.photoURL} alt="" />
                </div>
                <div className="textBox">
                    <p className="name">{user.name}</p>
                </div>
                <button className="removeBtn" onClick={() => handleRemoveMember(user.uid)}>
                    <span className="material-icons">remove_circle</span>
                </button>
            </div>
        </li>
    ));
    return (
        <ul className="memberList">
            {listItems}
        </ul>
    );
}

function ChannelModal({ isOpen, setIsOpen, channelInfo, modalType, channelId, members }) {
    const nodeRef = React.useRef(null);
    // 全域資料及方法
    const { state, dispatch } = useContext(GlobalContext);
    const [channelTitle, setChannelTitle] = useState("");
    const [channelDescription, setChannelDescription] = useState("");
    const [channelPrivacy, setChannelPrivacy] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tempMembers, setTempMembers] = useState([]);
    const [memberEmail, setMemberEmail] = useState("");

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

    const handleDelete = async () => {
        console.log("handleDelete");
        if (isLoading) return;
        const isConfirm = window.confirm('確定要刪除嗎？');
        if (!isConfirm) return;
        setIsLoading(true);
        const url = `/channels/${channelId}/`;
        const res = await CRUDRequest("delete", url);
        if (res) {
            setIsOpen(false);
        } else {
            pushErrorMsg("刪除失敗");
        }
    };

    const handleAddMember = async (uid) => {
        console.log("handleAddMember");
        if (isLoading) return;
        if (!uid) return;
        setIsLoading(true);
        const url = `/channels/${channelId}/members/${uid}/`;
        const res = await CRUDRequest("set", url, true);
        if (res) {
            setIsOpen(false);
        } else {
            pushErrorMsg("新增失敗");
        }
        setIsLoading(false);
    };

    const handleMemberRemove = async (uid) => {};

    const handleMemberSearch = async () => {
        console.log("handleMemberSearch");
        if (isLoading) return;
        if (!memberEmail.trim()) return;
        setIsLoading(true);
        try {
            // const res = await auth.fetchSignInMethodsForEmail(memberEmail);
            // if (res.length === 0) {
            //     pushErrorMsg("查無此帳號");
            // } else {
            //     const uid = res[0].split(".")[0];
            //     if (members.find((item) => item.uid === uid)) {
            //         pushErrorMsg("此帳號已在頻道中");
            //     } else {
            //         handleAddMember(uid);
            //     }
            // }
        } catch (err) {
            pushErrorMsg("查無此帳號");
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

    useEffect(() => {
        if (members) {
            setTempMembers(members);
        }
    }, [members]);

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
                                <div className="mb-3 switchGroup">
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
                                <div className="mb-3">
                                    <label className="form-label">頻道成員</label>
                                    <div className="form-control addBar">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="請輸入email新增頻道成員"
                                            value={memberEmail}
                                            onChange={(e) => setMemberEmail(e.target.value)}
                                        />
                                        <button type="button" className="btn btn-primary" onClick={() => {
                                            handleMemberSearch();
                                            // setMemberEmail("");
                                        }}>新增</button>
                                    </div>
                                    <MemberList members={tempMembers} setTempMembers={setTempMembers} />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            {modalType === 'edit' && <button type="button" className="btn btn-danger deleteBtn" onClick={() => handleDelete()}>刪除</button>}
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