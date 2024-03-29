
import { Link } from "react-router-dom";
import '../scss/ChannelType.scss';
import React, { useEffect, useContext, useState, useMemo, useRef } from "react";
import classNames from "classnames";
import GlobalContext from "../GlobalContext";

function PersonalChannelLink({ toggleMenu, personalChannel }) {
    // 全域資料及方法
    const { state, dispatch } = useContext(GlobalContext);
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        if (personalChannel && personalChannel.length > 0) {
            const channelsEl = personalChannel.map((channel) => {
                return (
                    <li key={channel.id}>
                        <Link to={`/channel/${channel.id}`} className="btn" onClick={() => toggleMenu(false)}>
                            <div className="imgBox">
                                {
                                    channel.info.photoURL ? <img src={channel.info.photoURL} alt={channel.info.title}/> :
                                    <span className="material-icons">stars</span>
                                }
                            </div>
                            <p className="title">{channel.info.title}</p>
                        </Link>
                    </li>
                );
            });
            setChannels(channelsEl);
        }
        return () => {
            setChannels([]);
        };
    }, [personalChannel, toggleMenu]);

    return (
        <ul className="channelList">
            {channels}
        </ul>
    );
}

function ChannelLink({ setIsChannelModalOpen, isMenuOpen, setChannelModalType, 
    setIsChannelSearchModalOpen, toggleMenu, personalChannel }) {
    const [sideMenuHeight, setSideMenuHeight] = useState(0);

    let resizeWindow = () => {
        if (window.innerWidth <= 1024) {
            setSideMenuHeight(window.innerHeight);
        } else {
            setSideMenuHeight(0);
        }
    };

    useEffect(() => {
        resizeWindow();
        window.addEventListener('resize', resizeWindow)
        return () => window.removeEventListener('resize', resizeWindow)
    }, []);

    return (
        <div className={classNames('channelTypeArea', isMenuOpen ? 'open' : '')} style={{ 'height': sideMenuHeight > 0 ? sideMenuHeight - 73 + 'px' : '' }}>
            <ul className="infoList">
                {/* <li>
                    <button className="btn home">
                        <span className="material-icons">home</span>
                        <p className="title">個人首頁</p>
                    </button>
                </li> */}
                <li>
                    <button className="btn" onClick={() => {
                        setChannelModalType('create');
                        setIsChannelModalOpen(true);
                    }}>
                        <span className="material-icons">add</span>
                        <p className="title">建立頻道</p>
                    </button>
                </li>
                <li>
                    <button className="btn" onClick={() => {
                        setIsChannelSearchModalOpen(true);
                    }}>
                        <span className="material-icons">travel_explore</span>
                        <p className="title">搜尋頻道</p>
                    </button>
                </li>
            </ul>
            <PersonalChannelLink toggleMenu={toggleMenu} personalChannel={personalChannel} />
        </div>
    )
}

export default ChannelLink;