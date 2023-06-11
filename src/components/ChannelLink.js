
import { Link } from "react-router-dom";
import '../scss/ChannelType.scss';
import React, { useEffect, useContext, useState, useMemo, useRef } from "react";
import classNames from "classnames";

function ChannelLink({ setIsOpen, isMenuOpen, setChannelModalType }) {
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
        <div className={classNames('channelTypeArea', isMenuOpen ? 'open': '')} style={{'height': sideMenuHeight > 0 ? sideMenuHeight - 73 + 'px' : ''}}>
            <ul>
                <li>
                    <button className="btn home">
                        <span className="material-icons">home</span>
                        <p className="title">個人首頁</p>
                    </button>
                </li>
                <li>
                    <button className="btn" onClick={() => {
                        setChannelModalType('create');
                        setIsOpen(true);
                    }}>
                        <span className="material-icons">add</span>
                        <p className="title">建立頻道</p>
                    </button>
                </li>
                <li>
                    <button className="btn">
                        <span className="material-icons">travel_explore</span>
                        <p className="title">搜尋頻道</p>
                    </button>
                </li>
                <li>
                    <Link to={`/channel/public2`} className="btn">
                        <span className="material-icons">public</span>
                        <p className="title">公開頻道</p>
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default ChannelLink;