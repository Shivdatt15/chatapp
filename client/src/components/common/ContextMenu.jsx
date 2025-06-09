import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

function ContextMenu({ options, cordinates, contextMenu, setContextMenu }) {
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id !== "context-opener") {
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
          setContextMenu(false);
        }
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [setContextMenu]);

  const handleClick = (e, callback) => {
    e.stopPropagation();
    setContextMenu(false);
    callback();
  };

  const menu = (
    <div
      ref={contextMenuRef}
      className="bg-gray-800 py-2 rounded-md shadow-xl absolute z-[10000]"
      style={{
        top: cordinates.y,
        left: cordinates.x,
      }}
    >
      <ul>
        {options.map(({ name, callback }) => (
          <li
            key={name}
            onClick={(e) => handleClick(e, callback)}
            className="px-5 py-2 cursor-pointer hover:bg-gray-700 text-white"
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );

  return ReactDOM.createPortal(menu, document.body);
}

export default ContextMenu;
