import React, { useEffect, useContext, useState, useMemo, useRef } from "react";
import GlobalContext from "../GlobalContext";
import { query, ref, onValue, db, limitToLast, CRUDRequest } from "../Firebase";
import dateTransform from "../utils/dateTransform";
import "../scss/ActivitySpace.scss";

function ActivitySpaceToolbar() {
  return (
    <div className="toolbarArea">
      <input type="search" placeholder="搜尋聊天室內容" />
      <ul>
        <li>
          <button className="btn">
            <span className="material-icons">person_add</span>
          </button>
        </li>
        {/* <li>
                    <button className="btn">
                        <span className="material-icons">groups</span>
                    </button>
                </li> */}
        <li>
          <button className="btn">
            <span className="material-icons">people_alt</span>
          </button>
        </li>
        <li>
          <button className="btn">
            <span className="material-icons">person</span>
          </button>
        </li>
        <li>
          <button className="btn">
            <span className="material-icons">settings</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

function MsgList(props) {
  const members = props.members ?? [];

  function getUserInfo(uid) {
    let userInfo = members.filter((obj) => obj.uid === uid);
    if (userInfo.length === 0) {
      return (userInfo = {});
    }
    return userInfo[0];
  }

  const listItems = props.msgData.map((item, i) => {
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

  return <ul className="msgList">{listItems}</ul>;
}

function ActivitySpace(props) {
  const { state, dispatch } = useContext(GlobalContext);
  const [inputMsg, setInputMsg] = useState("");
  const [msgData, setMsgData] = useState([]);
  const contentBoxEl = useRef(null)

  async function pushMsg(e) {
    if (e.key !== "Enter" || e.keyCode !== 13) return;
    console.log("push");
    const data = {
      timestamp: Date.now(),
      content: inputMsg,
      uid: state.userId,
    };
    const url = `channels/${props.channelId}/messages`;
    console.log(url);
    await CRUDRequest("push", url, data);
    contentBoxEl.current.scrollTop = contentBoxEl.current.scrollHeight
    setInputMsg('')
  }

  useEffect(() => {
    const msgRef = query(
      ref(db, `channels/${props.channelId}/messages`),
      limitToLast(100)
    );
    console.log("mounted", "ActivitySpace");
    const msgOff = onValue(msgRef, async (snapshot) => {
      let data = snapshot.val() ?? {};
      data = Object.values(data);
      console.log('new data arrive', data)
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
      console.log('轉換完成', newData);
      setMsgData(newData);
      contentBoxEl.current.scrollTop = contentBoxEl.current.scrollHeight
    });

    return () => {
      if (msgOff) {
        msgOff();
      }
    };
  }, [props.channelId]);

  return (
    <div className="activitySpaceArea">
      <ActivitySpaceToolbar />
      <div className="contentBox scrollbar" ref={contentBoxEl}>
        {useMemo(
          () => (
            <MsgList msgData={msgData} members={props.members} />
          ),
          [props.members, msgData]
        )}
      </div>
      <div className="inputArea">
        <input
          className="inputStyle-1"
          type="text"
          placeholder="輸入訊息"
          onKeyUp={pushMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          value={inputMsg}
        />
        <ul className="inputTool">
          <li>
            <button>
              <span className="material-icons">sentiment_satisfied_alt</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ActivitySpace;
