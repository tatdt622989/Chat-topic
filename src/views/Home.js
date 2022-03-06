import ActivitySpace from "../components/ActivitySpace";
import ChannelLink from "../components/ChannelLink";
import ChannelInfo from "../components/ChannelInfo";
import React, { useEffect, useContext, useState } from "react";
import { getChannelInfo, ref, onValue, db, get } from "../Firebase";
import GlobalContext from "../GlobalContext";
import { useParams, useNavigate } from "react-router-dom";

function Home() {
  const { state, dispatch } = useContext(GlobalContext);
  const { channelId } = useParams();
  const [chatType, setChatType] = useState("channel");
  const [channelInfo, setChannelInfo] = useState();
  const [channelMembers, setChannelMembers] = useState();
  const [chatId, setChatId] = useState("");
  let navigate = useNavigate();

  // 啟動Firebase監聽器
  useEffect(() => {
    console.log("mount");
    let memberOff;
    // 頻道成員監聽器，變動會自動更新當前頻道
    const membersRef = ref(db, `channels/${channelId}/members`);
    memberOff = onValue(membersRef, async (snapshot) => {
      const data = snapshot.val() ?? {};
      const userUids = Object.keys(data);
      const requests = [];
      userUids.forEach((uid) => {
        const usersRef = ref(db, `users/${uid}/publicInfo`);
        const res = get(usersRef)
          .then((snapshot) =>  snapshot.val())
          .catch((err) => err);
        console.log(res)
        requests.push(res);
      });

      await Promise.all(requests).then((values) => {
        console.log("members:", values);
        const newVal = values.map((obj, i) => {return {...obj, uid: userUids[i]}})
        setChannelMembers(newVal);
      });
    });
    return () => {
      console.log("unmount");
      if (memberOff) {
        memberOff();
      }
    };
  }, [channelId]);

  useEffect(() => {
    async function fetchData() {
      const info = await getChannelInfo(state.userId, chatType, channelId);
      setChannelInfo(info);
      if (!info) {
        navigate('/channel/public')
      }
    }
    if (chatType === "channel" && state.userId) {
      fetchData();
    }
  }, [chatType, state.userId, channelId]);

  return (
    <div className="view home">
      <ChannelLink />
      <div className="contentArea">
        <ChannelInfo info={channelInfo} members={channelMembers} />
        <ActivitySpace channelId={channelId} members={channelMembers} />
      </div>
    </div>
  );
}

export default Home;
