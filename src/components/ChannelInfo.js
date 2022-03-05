import React, { useEffect, useContext, useState } from "react";
import "../scss/ChannelInfo.scss";

function MemberList(props) {
  const members = props.members??[];
  console.log('memberListRender', members, props.members)
  const listItems = members.map((user) => (
    <li key={user}>
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

  return(
    <ul>
      {listItems}
    </ul>
  )
}

function ChannelInfo(props) {
  return (
    <div className="ChannelInfoArea">
      <h2>{props.info?.title}</h2>
      <p className="intro">{props.info?.description}</p>
      <p className="type">頻道成員</p>
      <MemberList members={props.members} />
      {/* <ul>
        <li>
          <button className="current">
            <div className="item">
              <div className="imgBox"></div>
              <div className="textBox">
                <p className="name">6yuwei</p>
                <p className="text">あす きゅうか が ひつよう です。</p>
              </div>
            </div>
          </button>
        </li>
        <li>
          <button>
            <div className="item">
              <div className="imgBox"></div>
              <div className="textBox">
                <p className="name">6yuwei</p>
                <p className="text">あす きゅうか が ひつよう です。</p>
              </div>
            </div>
          </button>
        </li>
      </ul> */}
    </div>
  );
}

export default ChannelInfo;
