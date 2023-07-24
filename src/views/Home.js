import ActivitySpace from "../components/ActivitySpace";
import ChannelLink from "../components/ChannelLink";
import ChannelInfo from "../components/ChannelInfo";
import ChannelModal from "../components/ChannelModal";
import ChannelSearchModal from "../components/ChannelSearchModal";
import React, { useEffect, useContext, useState, useCallback } from "react";
import { handleCRUDReq, getChannelInfo, ref, onValue, db, get, getUserChannels } from "../Firebase";
import GlobalContext from "../GlobalContext";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import ChannelUserInfoModal from "../components/ChannelUserInfoModal";

function Home() {
  const { state, dispatch } = useContext(GlobalContext);
  const { channelId } = useParams();
  const [chatType, setChatType] = useState("channel");
  const [channelInfo, setChannelInfo] = useState();
  const [channelMembers, setChannelMembers] = useState();
  const [chatId, setChatId] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(0);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isChannelSearchModalOpen, setIsChannelSearchModalOpen] = useState(false);
  const [isChannelUserInfoModalOpen, setIsChannelUserInfoModalOpen] = useState(false);
  const [channelModalType, setChannelModalType] = useState("create");
  const [personalChannel, setPersonalChannel] = useState([]);

  let navigate = useNavigate();

  const toggleMenu = useCallback((isOpen) => {
    if (typeof isOpen !== 'boolean') {
      setIsMenuOpen(!isMenuOpen);
    } else {
      setIsMenuOpen(isOpen);
    }
  }, [isMenuOpen]);

  const getPersonalChannel = useCallback(async () => {
    const res = await getUserChannels({ text: '' }).then((res) => res).catch((err) => err);
    if (res.data) {
      setPersonalChannel(res.data);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      const info = await getChannelInfo(state.userId, chatType, channelId);
      setChannelInfo(info);
      if (!info) {
        navigate("/channel/public");
      }

      // validate the user's access to the channel
      const members = await handleCRUDReq('get', `channels/${channelId}/members`);
      const memberIds = Object.keys(members ?? {});
      if (!memberIds.includes(state.userId) && info.privacy === "private") {
        navigate("/channel/public");
      }

      // 更新使用者最後進入頻道的時間
      const updates = {};
      updates[`/${channelId}`] = { lastAccessTime: Date.now() };
      handleCRUDReq('update', `users/${state.userId}/channels`, updates);
    }

    if (chatType === "channel" && state.userId && !isChannelModalOpen) {
      fetchData();
    }

    let memberOff;
    // 頻道成員監聽器，變動會自動更新當前頻道
    const membersRef = ref(db, `channels/${channelId}/members`);
    memberOff = onValue(membersRef, async (snapshot) => {
      const data = snapshot.val() ?? {};
      const userUids = Object.keys(data);
      const userChannelData = Object.values(data);
      const requests = [];
      userUids.forEach((uid) => {
        const usersRef = ref(db, `users/${uid}/publicInfo`);
        const res = get(usersRef)
          .then((snapshot) => snapshot.val())
          .catch((err) => err);
        requests.push(res);
      });

      await Promise.all(requests).then((values) => {
        const newVal = values.map((obj, i) => {
          return { ...obj, uid: userUids[i], ...userChannelData[i] };
        });
        setChannelMembers(newVal);
      });
    });

    return () => {
      if (memberOff) {
        memberOff();
      }
    };
  }, [chatType, state.userId, channelId, isChannelModalOpen, navigate]);

  useEffect(() => {
    getPersonalChannel();
  }, []);

  return (
    <div className="view home">
      <ChannelLink 
        isMenuOpen={isMenuOpen}
        setIsChannelModalOpen={setIsChannelModalOpen}
        setChannelModalType={setChannelModalType}
        setIsChannelSearchModalOpen={setIsChannelSearchModalOpen}
        toggleMenu={toggleMenu}
        personalChannel={personalChannel}
        setPersonalChannel={setPersonalChannel}
      />
      <div className="contentArea">
        <ChannelInfo
          info={channelInfo}
          members={channelMembers}
          userId={state.userId}
          setModalOpen={setIsChannelModalOpen}
          setModalType={setChannelModalType}
        />
        <ActivitySpace
          channelId={channelId}
          members={channelMembers}
          info={channelInfo}
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
          setIsOpen={setIsChannelUserInfoModalOpen}
          setIsChannelSearchModalOpen={setIsChannelSearchModalOpen}
          getPersonalChannel={getPersonalChannel}
        />
        <ChannelModal 
          isOpen={isChannelModalOpen}
          setIsOpen={setIsChannelModalOpen}
          channelInfo={channelInfo}
          modalType={channelModalType}
          channelId={channelId}
          members={channelMembers}
          />
        <ChannelSearchModal 
          isOpen={isChannelSearchModalOpen}
          setIsOpen={setIsChannelSearchModalOpen}
        />
        <ChannelUserInfoModal 
          isOpen={isChannelUserInfoModalOpen}
          setIsOpen={setIsChannelUserInfoModalOpen}
        />
      </div>
      <Toast />
    </div>
  );
}

export default Home;
