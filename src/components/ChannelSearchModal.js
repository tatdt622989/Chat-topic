import React, { useState, useEffect, useContext, useCallback } from 'react';
import GlobalContext from "../GlobalContext";
import { CSSTransition } from 'react-transition-group';
import '../scss/ChannelSearchModal.scss';

function ChannelSearchModal({ isOpen, setIsOpen }) {
    const nodeRef = React.useRef(null);
    return (
        <CSSTransition
            in={isOpen}
            timeout={500}
            classNames="modal-fade"
            nodeRef={nodeRef}
            unmountOnExit
        >
        <div className="modal" tabIndex="-1" ref={nodeRef}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Modal title</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsOpen(false)}></button>
                </div>
                <div className="modal-body">
                    <p>Modal body text goes here.</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                </div>
                </div>
            </div>
        </div>
        </CSSTransition>
    );
}

export default ChannelSearchModal;