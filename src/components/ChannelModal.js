import React, { useState, useEffect, useContext, useCallback } from 'react';
import imgToBase64 from "../utils/imgToBase64";
import GlobalContext from "../GlobalContext";
import { CSSTransition } from 'react-transition-group';
import '../scss/ChannelModal.scss';
import { handleCRUDReq, auth, createChannel, fileUploader } from "../Firebase";

function MemberList({ members, setTempMembers }) {
    // 全域資料及方法
    const { state, dispatch } = useContext(GlobalContext);
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
                {user.uid !== state.userId && <button className="removeBtn" onClick={() => handleRemoveMember(user.uid)}>
                    <span className="material-icons">remove_circle</span>
                </button>}
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
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState("");

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
            console.log("setTimeout");
            dispatch({
                type: "setToastList",
                payload: {
                    action: "delete",
                    id,
                },
            });
        }, 3000);
    }, [dispatch]);

    const handleSave = async () => {
        if (isLoading) return;
        if (!channelTitle.trim()) {
            pushErrorMsg("請輸入頻道名稱");
            return;
        }
        let usedChannelId = channelId;
        setIsLoading(true);
        if (modalType === "create") {
            const data = {
                title: channelTitle,
                description: channelDescription,
                privacy: channelPrivacy ? 'public' : 'private',
                owner: auth.currentUser.uid,
            };
            const res = await createChannel(data).then((res) => res).catch((err) => err);
            if (res.data && res.data.channelId) {
                usedChannelId = res.data.channelId;
            }
            if (res) {
                setIsOpen(false);
            } else {
                pushErrorMsg("新增失敗");
            }
        }
        if (modalType === "edit") {
            const tempMembersObj = {};
            tempMembers.forEach((item) => {
                tempMembersObj[item.uid] = {
                    joinTimestamp: item.joinTimestamp,
                    lastActivity: item.lastActivity,
                };
            });

            const updates = {};
            updates[`/channels/${usedChannelId}/info/title`] = channelTitle;
            updates[`/channels/${usedChannelId}/info/description`] = channelDescription;
            updates[`/channels/${usedChannelId}/info/privacy`] = channelPrivacy;
            updates[`/channels/${usedChannelId}/members`] = tempMembersObj;

            if (!usedChannelId) return pushErrorMsg("發生錯誤");
            const url = `/channels/${usedChannelId}/`;
            const res = await handleCRUDReq("updateMultiPath", url, updates);
            if (res) {
                setIsOpen(false);
            } else {
                pushErrorMsg("更新失敗");
            }
        }
        if (file) {
            console.log(`channels/${usedChannelId}`);
            const fileUrl = await fileUploader(`channels/${usedChannelId}/${file.name}`, file);
            if (!fileUrl.url) {
                pushErrorMsg("上傳失敗");
                return;
            }
            setFileUrl(fileUrl.url);
            const res = await handleCRUDReq("update", `/channels/${usedChannelId}/info`, { photoURL: fileUrl.url });
            if (!res) {
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
        const res = await handleCRUDReq("delete", url);
        if (res) {
            setIsOpen(false);
        } else {
            pushErrorMsg("刪除失敗");
        }
    };

    const handleMemberSearch = async () => {
        console.log("handleMemberSearch");
        if (isLoading) return;
        if (!memberEmail.trim()) return;
        setIsLoading(true);
        try {
            const res = await handleCRUDReq("get", `/users/`);
            if (res) {
                console.log(res);
                let user = null;
                Object.entries(res).find((item) => {
                    console.log(item[1].publicInfo.email, memberEmail);
                    if (item[1].publicInfo.email === memberEmail) {
                        user = {};
                        user.description = item[1].publicInfo.description;
                        user.email = item[1].publicInfo.email;
                        user.name = item[1].publicInfo.name;
                        user.photoURL = item[1].publicInfo.photoURL;
                        user.id = item[0];
                        return true;
                    }
                });
                console.log(user);
                if (user) {
                    // 已經是頻道成員，不可重複新增
                    if (tempMembers.find((item) => item.uid === user.id)) {
                        pushErrorMsg("此帳號已經是頻道成員");
                        setIsLoading(false);
                        return;
                    }
                    if (user.uid === auth.currentUser.uid) {
                        pushErrorMsg("無法新增自己");
                        setIsLoading(false);
                        return;
                    }
                    setTempMembers([...tempMembers, user]);
                    setMemberEmail("");
                } else {
                    pushErrorMsg("查無此帳號");
                }
            }
        } catch (err) {
            pushErrorMsg("查無此帳號");
        }
        setIsLoading(false);
    };

    const handlerFileChange = async (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            const url = await imgToBase64(e.target.files[0]);
            setFileUrl(url);
        }
    };

    useEffect(() => {
        if (channelInfo) {
            setChannelTitle(channelInfo.title);
            setChannelDescription(channelInfo.description);
            setChannelPrivacy(channelInfo.privacy);
            setFileUrl(channelInfo.photoURL);
        } else {
            setChannelTitle("");
            setChannelDescription("");
            setChannelPrivacy(false);
            setFileUrl("");
        }
    }, [channelInfo]);

    useEffect(() => {
        if (isOpen && modalType === "create") {
            setChannelTitle("");
            setChannelDescription("");
            setChannelPrivacy(false);
            setFileUrl("");
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
                                    <input type="checkbox" id="privacySwitch" checked={channelPrivacy === 'public'} onChange={(e) => {
                                        if (e.target.checked) {
                                            setChannelPrivacy('public');
                                        } else {
                                            setChannelPrivacy('private');
                                        }
                                    }} />
                                    <label htmlFor="privacySwitch" className="form-label switch"></label>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">頻道圖片</label>
                                    <div className="fileStyle-1">
                                        <label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlerFileChange}
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
                                {modalType === 'edit' &&
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
                                                setMemberEmail("");
                                            }}>新增</button>
                                        </div>
                                        <MemberList members={tempMembers} setTempMembers={setTempMembers} />
                                    </div>
                                }
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