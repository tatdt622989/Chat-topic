import "../scss/EmailSend.scss";
import React, { useEffect, useContext, useState } from "react";

function EmailSend() {

  return(
    <div className="view email-send">
      <div className="wrap">
        <div className="item">
          <span className="material-icons">check</span>
          <p>電子郵件驗證信已發送至您的信箱，請查看郵件並點選連結以登入Chat Topic！</p>
        </div>
      </div>
    </div>
  );
}

export default EmailSend;
