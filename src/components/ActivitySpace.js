import React, { useEffect, useContext, useState, useMemo, useRef } from "react";
import GlobalContext from "../GlobalContext";
import classNames from "classnames";
import { query, ref, onValue, db, limitToLast, handleCRUDReq } from "../Firebase";
import dateTransform from "../utils/dateTransform";
import "../scss/ActivitySpace.scss";
import { set } from "firebase/database";

function ActivitySpaceToolbar({ 
  toggleMenu, 
  info, 
  setIsOpen, 
  setChatSearchKeyword, 
  setIsChannelSearchModalOpen ,
  chatSearchKeyword
}) {
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setKeyword(chatSearchKeyword);
  }, [chatSearchKeyword]);

  return (
    <div className="toolbarArea">
      <div className="left">
        <button
          className="btn menu"
          onClick={() => {
            toggleMenu();
          }}
        >
          <span className="material-icons">sync_alt</span>
        </button>
        <h2>{info?.title}</h2>
      </div>
      <input
        type="search" 
        placeholder="搜尋聊天室內容" 
        value={keyword} 
        onChange={(e) => setKeyword(e.target.value)} 
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            setChatSearchKeyword(keyword);
          }
        }}
      />
      <ul>
        <li className="search">
          <button className="btn" onClick={() => setIsChannelSearchModalOpen(true)}>
            <span className="material-icons">search</span>
          </button>
        </li>
        {/* <li className="add">
          <button className="btn">
            <span className="material-icons">person_add</span>
          </button>
        </li>
         */}
        <li className="member">
          <button className="btn">
            <span className="material-icons">people_alt</span>
          </button>
        </li>
        <li className="personal">
          <button className="btn" onClick={(e) => setIsOpen(true)}>
            <span className="material-icons">person</span>
          </button>
        </li>
        {/* <li className="settings">
          <button className="btn">
            <span className="material-icons">settings</span>
          </button>
        </li> */}
      </ul>
    </div>
  );
}

function MsgList({ msgData, members, toggleMenu }) {
  const membersData = members ?? [];

  function getUserInfo(uid) {
    let userInfo = membersData.filter((obj) => obj.uid === uid);
    if (userInfo.length === 0) {
      return (userInfo = {});
    }
    return userInfo[0];
  }

  const listItems = msgData.map((item, i) => {
    const userInfo =
      Array.isArray(item) && item.length > 0 ? getUserInfo(item[0].uid) : {};
    return (
      <li key={i}>
        <div className="item">
          <div className="imgBox">
            <img src={userInfo.photoURL ?? ""} alt={userInfo.name ?? ""} />
          </div>
          <div className="textBox">
            <p className="title">
              <span className="name">{userInfo.name ?? ""}</span>{" "}
              <span className="date">
                {dateTransform(
                  "y/m/d",
                  Array.isArray(item) && item.length > 0
                    ? item[0].timestamp
                    : ""
                )}
              </span>
            </p>
            {item.map((obj, n) => {
              return (
                <p className="text" key={`${i}-${n}`}>
                  <span>{obj.content}</span>
                  <br />
                  <time>{dateTransform("h:i:s", obj.timestamp)}</time>
                </p>
              );
            })}
          </div>
        </div>
      </li>
    );
  });

  return <ul className="msgList" onClick={() => toggleMenu(false)}>{listItems}</ul>;
}

function EmojiList({ handleEmojiInput }) {
  const [emojiList, setEmojiList] = useState([
    "😀",
    "😁",
    "😂",
    "🤣",
    "😃",
    "😄",
    "😅",
    "😆",
    "😉",
    "😊",
    "😋",
    "😎",
    "😍",
    "😘",
    "🥰",
    "😗",
    "😙",
    "🥲",
    "😚",
    "🙂",
    "🤗",
    "🤩",
    "🤔",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😶‍🌫️",
    "🙄",
    "😏",
    "😣",
    "😥",
    "😮",
    "🤐",
    "😯",
    "😪",
    "😫",
    "🥱",
    "😴",
    "😌",
    "😛",
    "😜",
    "😝",
    "🤤",
    "😒",
    "😓",
    "😔",
    "😕",
    "🙃",
    "🤑",
    "😲",
    "☹️",
    "🙁",
    "😖",
    "😞",
    "😟",
    "😤",
    "😢",
    "😭",
    "😦",
    "😧",
    "😨",
    "😩",
    "🤯",
    "😬",
    "😮‍💨",
    "😰",
    "😱",
    "🥵",
    "🥶",
    "😳",
    "🤪",
    "😵",
    "😵‍💫",
    "🥴",
    "😠",
    "😡",
    "🤬",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "🤧",
    "😇",
    "🥳",
    "🥸",
    "🥺",
    "🤠",
    "🤡",
    "🤥",
    "🤫",
    "🤭",
    "🧐",
    "🤓",
    "😈",
    "👹",
    "👺",
    "💀",
    "☠️",
    "👻",
    "👽",
    "👾",
    "🤖",
    "💩",
    "😺",
    "😸",
    "😹",
    "😻",
    "😼",
    "😽",
    "🙀",
    "😿",
    "😾",
  ]);
  const emojiElList = emojiList.map((el) => (
    <li onClick={handleEmojiInput} className="item" key={el}>
      {el}
    </li>
  ));
  return <ul className="emojiList scrollbar">{emojiElList}</ul>;
}

function ActivitySpace({ channelId, setIsOpen, members, toggleMenu, info, setIsChannelSearchModalOpen, getPersonalChannel }) {
  const { state, dispatch } = useContext(GlobalContext);
  const [inputMsg, setInputMsg] = useState("");
  const [msgData, setMsgData] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [displayMsgData, setDisplayMsgData] = useState([]);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const contentBoxEl = useRef(null);
  const [chatSearchKeyword, setChatSearchKeyword] = useState("");
  const [inputIndex, setInputIndex] = useState({
    start: 0,
    end: 0,
  });

  async function pushMsg(e) {
    if (e.key !== "Enter" || e.keyCode !== 13) return;
    setChatSearchKeyword("");
    const data = {
      timestamp: Date.now(),
      content: inputMsg,
      uid: state.userId,
    };
    const url = `channels/${channelId}/messages`;
    await handleCRUDReq("push", url, data);
    contentBoxEl.current.scrollTop = contentBoxEl.current.scrollHeight;
    setInputMsg("");
  }

  function handleEmojiClose() {
    setIsEmojiOpen(false);
  }

  function handleEmojiInput(e) {
    const text = e.target.innerText;
    setInputMsg(
      inputMsg.slice(0, inputIndex.start) +
      text +
      inputMsg.slice(inputIndex.end)
    );
    setInputIndex({
      start: inputIndex.start + text.length,
      end: inputIndex.start + text.length,
    });
  }

  function getInputSelection(e) {
    setInputIndex({
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    });
  }

  useEffect(() => {
    const data = msgData.filter((obj) => {
      if (Array.isArray(obj)) {
        return obj.some((item) => item.content.includes(chatSearchKeyword));
      }
      return obj.content.includes(chatSearchKeyword);
    });
    setSearchResult(data);
  }, [chatSearchKeyword, msgData]);

  useEffect(() => {
    if (searchResult.length === 0) {
      setDisplayMsgData(msgData);
    } else {
      setDisplayMsgData(searchResult);
    }
  }, [searchResult, msgData]);

  useEffect(() => {
    document.addEventListener("click", handleEmojiClose);
    return () => document.removeEventListener("click", handleEmojiClose);
  }, [isEmojiOpen]);

  useEffect(() => {
    const msgRef = query(
      ref(db, `channels/${channelId}/messages`),
      limitToLast(10000)
    );
    const msgOff = onValue(msgRef, async (snapshot) => {
      let data = snapshot.val() ?? {};
      data = Object.values(data);
      const newData = [];
      let tempAry = [];
      data.forEach((obj, i) => {
        const tempStr =
          i > 0 ? dateTransform("y-m-d", tempAry[0].timestamp) : "";
        const currentStr = dateTransform("y-m-d", obj.timestamp);
        if (i === 0 || (tempAry[0].uid === obj.uid && tempStr === currentStr)) {
          tempAry.push(obj);
        } else {
          newData.push(tempAry);
          tempAry = [obj];
        }
        if (i + 1 === data.length) {
          newData.push(tempAry);
        }
      });
      setMsgData(newData);
      contentBoxEl.current.scrollTop = contentBoxEl.current.scrollHeight;
    }, (err) => console.log(err));

    getPersonalChannel();

    return () => {
      if (msgOff) {
        msgOff();
        console.log("msgOff", msgOff);
      }
    };
  }, [channelId, getPersonalChannel]);

  return (
    <div className="activitySpaceArea">
      <ActivitySpaceToolbar 
        members={members} 
        info={info} 
        toggleMenu={toggleMenu} 
        chatSearchKeyword={chatSearchKeyword}
        setIsOpen={setIsOpen} 
        setChatSearchKeyword={setChatSearchKeyword}
        setIsChannelSearchModalOpen={setIsChannelSearchModalOpen}
      />
      <div className="contentBox scrollbar" ref={contentBoxEl}>
        {useMemo(
          () => (
            <MsgList msgData={displayMsgData} members={members} toggleMenu={toggleMenu} />
          ),
          [members, displayMsgData, toggleMenu]
        )}
      </div>
      <div className="inputArea">
        <input
          className="inputStyle-1"
          type="text"
          placeholder="輸入訊息"
          onKeyUp={pushMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onBlur={getInputSelection}
          value={inputMsg}
        />
        <ul className="inputTool">
          <li className={classNames("emoji", { open: isEmojiOpen })}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEmojiOpen(!isEmojiOpen);
              }}
            >
              <span className="material-icons">sentiment_satisfied_alt</span>
            </button>
            <div className="emojiMenu" onClick={(e) => e.stopPropagation()}>
              <EmojiList handleEmojiInput={handleEmojiInput} />
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ActivitySpace;
