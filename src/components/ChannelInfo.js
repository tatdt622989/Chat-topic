import '../scss/ChannelInfo.scss';

function ChannelInfo() {
    return (
        <div className="ChannelInfoArea">
            <h2>Room Title</h2>
            <p className="intro">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem, numquam!
            </p>
            <p className="type">頻道成員</p>
            <ul>
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
            </ul>
        </div>
    )
}

export default ChannelInfo;