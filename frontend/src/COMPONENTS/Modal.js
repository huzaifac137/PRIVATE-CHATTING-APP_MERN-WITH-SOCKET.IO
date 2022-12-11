import React, { useState } from "react";

function ExampleModal({ confirmLogout }) {
  // Use the useState hook to add state to the component
  const [isOpen, setIsOpen] = useState(false);

  // This function will be called when the user wants to open the modal
  const openModal = () => {
    setIsOpen(true);
  };

  // This function will be called when the user wants to close the modal
  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <div>
      {/* This button will be used to open the modal */}
      <button className="btn-danger" onClick={openModal}>
        LOGOUT
      </button>
      {isOpen ? (
        <div className="modal">
          {/* Use a ternary operator to conditionally render the modal */}

          <div>
            {/* This is the modal content */}
            <p>Do you want to logout?</p>

            {/* This button will be used to close the modal */}
            <button onClick={confirmLogout}>Yes</button>
            <button onClick={closeModal}>No</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ExampleModal;
