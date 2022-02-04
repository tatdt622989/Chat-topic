import "../scss/Loading.scss";
import { ReactComponent as LoadingIcon } from "../images/loading.svg";
import React, { useEffect, useContext, useState } from "react";
import classNames from "classnames";

function Loading(props) {
  return(
    <div className={classNames("loading", {
      show: props.isOpen
    })}>
      <div className="item">
        <LoadingIcon />
        <div className="Txt">
          <p>
            CHAT TOPIC
          </p>
        </div>
      </div>
    </div>
  )
}

export default Loading;