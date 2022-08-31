
import { Link } from "react-router-dom";
import '../scss/ChannelType.scss';
import React, { useEffect, useContext, useState, useMemo, useRef } from "react";

function ChannelLink(props) {
    const [sideMenuHeight, setSideMenuHeight] = useState(window.innerHeight);

    let resizeWindow = () => {
        if (window.innerWidth <= 1024) {
            setSideMenuHeight(window.innerHeight);
        } else {
            setSideMenuHeight(0);
        }
    };

    useEffect(() => {
        window.addEventListener('resize', resizeWindow)
        return () => window.removeEventListener('resize', resizeWindow)
    }, []);

    return (
        <div className="channelTypeArea" style={{'height': sideMenuHeight > 0 ? sideMenuHeight - 73 + 'px' : ''}}>
            <ul>
                <li>
                    <button className="btn home">
                        <span className="material-icons">home</span>
                    </button>
                </li>
                <li>
                    <button className="btn">
                        <span className="material-icons">add</span>
                    </button>
                </li>
                <li>
                    <button className="btn">
                        <span className="material-icons">travel_explore</span>
                    </button>
                </li>
                <li>
                    <Link to={`/channel/public2`} className="btn">
                        <span className="material-icons">public</span>
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default ChannelLink;