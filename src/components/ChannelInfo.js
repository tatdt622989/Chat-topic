import React, { useEffect, useContext, useState } from "react";
import "../scss/ChannelInfo.scss";

function MemberList(props) {
  const members = props.members ?? [];
  const listItems = members.map((user) => (
    <li key={user.uid}>
      <button className="current">
        <div className="item">
          <div className="imgBox">
            <img src={user.photoURL} alt="" />
          </div>
          <div className="textBox">
            <p className="name">{user.name}</p>
            <p className="text">{user.description}</p>
          </div>
        </div>
      </button>
    </li>
  ));

  return (
    <ul>
      {listItems}
    </ul>
  )
}

function ChannelInfo({ userId, info, members, setModalOpen, setModalType }) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userId === info?.owner) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [info, userId]);

  return (
    <div className="ChannelInfoArea">
      <div className="head">
        <h2>{info?.title}</h2>
        {isEditing && (
          <button className="btn editBtn" onClick={() => {
            setModalType('edit');
            setModalOpen(true);
          }}>
            <span className="material-icons">edit</span>
          </button>
        )}
      </div>
      <p className="intro">{info?.description}</p>
      <div className="channelListBox">
        <p className="type">頻道成員</p>
        <MemberList members={members} />
      </div>
    </div>
  );
}

export default ChannelInfo;
