import '../scss/ChannelType.scss';

function ChannelType() {
    return (
        <div className="channelTypeArea">
            <ul>
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
            </ul>
        </div>
    )
}

export default ChannelType;