
import { Link } from "react-router-dom";
import '../scss/ChannelType.scss';

function ChannelLink(props) {

    return (
        <div className="channelTypeArea">
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