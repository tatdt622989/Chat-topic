import "../scss/ActivitySpace.scss";

function ActivitySpaceToolbar() {
  return (
    <div className="toolbarArea">
      <input type="search" placeholder="搜尋聊天室內容" />
      <ul>
        <li>
          <button className="btn">
            <span className="material-icons">person_add</span>
          </button>
        </li>
        {/* <li>
                    <button className="btn">
                        <span className="material-icons">groups</span>
                    </button>
                </li> */}
        <li>
          <button className="btn">
            <span className="material-icons">people_alt</span>
          </button>
        </li>
        <li>
          <button className="btn">
            <span className="material-icons">person</span>
          </button>
        </li>
        <li>
          <button className="btn">
            <span className="material-icons">settings</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

function ActivitySpace() {
  return (
    <div className="activitySpaceArea">
      <ActivitySpaceToolbar />
      <div className="contentBox">
        <ul className="msgList">
          <li>
            <div className="item">
              <div className="imgBox"></div>
              <div className="textBox">
                <p className="name">
                  6yuwei <span className="date">12:00</span>
                </p>
                <p className="text">安安，你在幹嘛？</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div className="inputArea">
        <input className="inputStyle-1" type="text" placeholder="輸入訊息" />
        <ul className="inputTool">
          <li>
            <button>
              <span className="material-icons">sentiment_satisfied_alt</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ActivitySpace;
