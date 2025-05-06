import React, { useState } from "react";
import { WindowProgram } from "packard-belle";
//import { Window } from "../tools/Window";
import { outlook16 } from "../../icons";
import "./_styles.scss";
// import icons
//import inboxIcon from "packard-belle/images/icons/16x16/folder_open.bmp";
//import mailIcon from "packard-belle/images/icons/16x16/mail.bmp";

export default function Outlook98Mockup() {
  const [selectedEmail, setSelectedEmail] = useState(null);

  const emails = [
    {
      id: 1,
      subject: "Welcome to Outlook 98",
      content: "This is a mockup of the reading pane.",
    },
    {
      id: 2,
      subject: "Getting Started with Email",
      content: "Learn how to use email effectively.",
    },
  ];

  return (
    <WindowProgram
      title="Microsoft Outlook"
      initialWidth={800}
      initialHeight={600}
      resizable
      className="outlook-window"
    >
      <div className="flex items-start p-4 bg-[#c0c0c0] min-h-screen font-sans">
        <div className="pb-window w-full max-w-6xl">
          <div className="pb-window-body flex h-[500px]">
            {/* Sidebar */}
            <div className="w-[180px] bg-[#e0e0e0] border-r-2 border-gray-400 p-2 text-sm">
              <div className="mb-2 font-bold">Folders</div>
              <ul className="space-y-1">
                <li className="flex items-center gap-1">
                  <img src={outlook16} alt="Folder icon for Inbox" /> Inbox
                </li>
                <li className="flex items-center gap-1">
                  <img src={outlook16} alt="Folder icon for Outbox" /> Outbox
                </li>
                <li className="flex items-center gap-1">
                  <img src={outlook16} alt="Folder icon for Sent Items" /> Sent Items
                </li>
                <li className="flex items-center gap-1">
                  <img src={outlook16} alt="Folder icon for Deleted Items" /> Deleted Items
                </li>
              </ul>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col">
              {/* Toolbar */}
              <div className="bg-[#d4d0c8] border-b-2 border-gray-300 p-1 text-xs flex gap-2">
                <button className="pb-button" aria-label="File menu">
                  File
                </button>
                <button className="pb-button" aria-label="Edit menu">
                  Edit
                </button>
                <button className="pb-button" aria-label="View menu">
                  View
                </button>
                <button className="pb-button" aria-label="Tools menu">
                  Tools
                </button>
                <button className="pb-button" aria-label="Help menu">
                  Help
                </button>
              </div>

              {/* Email List */}
              <div className="flex-1 flex flex-col border-b border-gray-400 overflow-y-auto">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center gap-2 p-2 border-b border-gray-300 hover:bg-[#f0f0f0] cursor-pointer"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <img src={outlook16} alt="Mail icon" />
                    <span className="font-bold">{email.subject}</span>
                  </div>
                ))}
              </div>

              {/* Reading Pane */}
              <div className="p-2 text-sm bg-white h-[160px] overflow-auto">
                {selectedEmail ? (
                  <>
                    <h2 className="font-bold mb-1">{selectedEmail.subject}</h2>
                    <p>{selectedEmail.content}</p>
                  </>
                ) : (
                  <p>Select an email to view its content.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowProgram>
  );
}
