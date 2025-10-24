import React, { useState, useEffect } from "react";
import axios from "axios";

function ReservationDetails({ reservation, setView, refreshReservations, user }) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [processingAction, setProcessingAction] = useState("");
  const [conflictInfo, setConflictInfo] = useState(null);
  const [localReservation, setLocalReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEndEarlyConfirm, setShowEndEarlyConfirm] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showApproveExtensionConfirm, setShowApproveExtensionConfirm] = useState(false);
  const [showRejectExtensionConfirm, setShowRejectExtensionConfirm] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Load reservation from localStorage on component mount
  useEffect(() => {
    const loadReservation = () => {
      if (reservation) {
        setLocalReservation(reservation);
        localStorage.setItem('selectedReservation', JSON.stringify(reservation));
        setLoading(false);
        loadParticipants(reservation._id);
        return;
      }

      const savedReservation = localStorage.getItem('selectedReservation');
      if (savedReservation) {
        try {
          const parsedReservation = JSON.parse(savedReservation);
          setLocalReservation(parsedReservation);
          loadParticipants(parsedReservation._id);
        } catch (error) {
          console.error('Error parsing saved reservation:', error);
          localStorage.removeItem('selectedReservation');
        }
      }
      setLoading(false);
    };

    loadReservation();
  }, [reservation]);

  // Load participants for the reservation
  const loadParticipants = async (reservationId) => {
    if (!reservationId) return;
    
    setLoadingParticipants(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/reservations/${reservationId}/participants`);
      setParticipants(response.data.participants || []);
    } catch (error) {
      console.error('Error loading participants:', error);
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Add participant function
  const addParticipant = async (participantData) => {
    if (!localReservation?._id) return;
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/reservations/${localReservation._id}/participants`,
        participantData
      );
      
      // Refresh participants list
      loadParticipants(localReservation._id);
      return response.data;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  };

  // Remove participant function
  const removeParticipant = async (participantId) => {
    if (!localReservation?._id) return;
    
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/reservations/${localReservation._id}/participants/${participantId}`
      );
      
      // Refresh participants list
      loadParticipants(localReservation._id);
      return response.data;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  };

  // Fetch user by ID number
  const fetchUserByIdNumber = async (idNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/id-number/${idNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by ID number:', error);
      throw error;
    }
  };

  const getReservationUserId = () => {
    if (!localReservation || !localReservation.userId) return null;
    return typeof localReservation.userId === 'string' 
      ? localReservation.userId 
      : localReservation.userId._id;
  };

  const reservationUserId = getReservationUserId();
  const isMainReserver = user && reservationUserId === user._id;
  const isStaffOrAdmin = user && (user.role === "Staff" || user.role === "Admin");

  const handleAction = async (action, data = {}) => {
    if (!localReservation) return;
    
    setProcessingAction(action);
    setModalMessage("");

    try {
      let endpoint = "";
      let method = "post";
      let requestData = {};

      switch (action) {
        case "approve":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/status`;
          method = "patch";
          requestData = { status: "Approved" };
          break;

        case "reject":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/status`;
          method = "patch";
          requestData = { status: "Rejected" };
          break;

        case "start":
          endpoint = `http://localhost:5000/api/reservations/start/${localReservation._id}`;
          method = "post";
          break;

        case "end-early":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/end-early`;
          method = "post";
          break;

        case "cancel":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}`;
          method = "delete";
          break;

        case "request-extension":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/request-extension`;
          method = "put";
          requestData = { 
            reason: data.reason || "Need more time"
          };
          break;

        case "approve-extension":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/handle-extension`;
          method = "put";
          requestData = { action: "approve" };
          break;

        case "reject-extension":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/handle-extension`;
          method = "put";
          requestData = { action: "reject" };
          break;

        default:
          throw new Error("Unknown action");
      }

      const response = await axios({
        method,
        url: endpoint,
        data: Object.keys(requestData).length > 0 ? requestData : undefined,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (action === "request-extension" && response.data.conflictTime) {
        setConflictInfo({
          time: new Date(response.data.conflictTime),
          hasConflict: true
        });
      }

      setModalMessage(response.data.message || "Action completed successfully.");
      setShowResultModal(true);
      
      if (refreshReservations) refreshReservations();
      
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          `Failed to ${action} reservation`;
      setModalMessage(errorMessage);
      setShowResultModal(true);
    } finally {
      setProcessingAction("");
    }
  };

  const handleShowExtendModal = () => {
    setShowExtendModal(true);
  };

  const handleExtendSubmit = async () => {
    await handleAction("request-extension", {
      extensionType: "continuous"
    });
    setShowExtendModal(false);
  };

  const cancelReservation = async () => {
    setCancelling(true);
    await handleAction("cancel");
    setCancelling(false);
    setShowCancelConfirm(false);
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    
    if (modalMessage.includes("no longer available") || modalMessage.includes("deleted")) {
      localStorage.removeItem('selectedReservation');
      setLocalReservation(null);
    }
    
    if (refreshReservations) refreshReservations();
    setView("dashboard");
  };

  const formatTimeOnly = (datetime) =>
    new Date(datetime).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDateOnly = (datetime) =>
    new Date(datetime).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!localReservation) {
    return (
      <div>
        <h1>No reservation selected</h1>
        <p>Please select a reservation from the list</p>
        <button onClick={() => setView("dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const canRequestExtension = localReservation.status === "Ongoing" && 
                             !localReservation.extensionRequested && 
                             isMainReserver;

  const hasPendingExtension = localReservation.extensionRequested && 
                             localReservation.extensionStatus === "Pending";

  return (
    <div>
      <header>
        <h1>Reservation Details</h1>
        <button onClick={() => setView("dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <div>
        {/* Reservation Information */}
        <div>
          <h2>Reservation Information</h2>
          
          {hasPendingExtension && (
            <div>
              <span>Extension Request Pending Approval</span>
            </div>
          )}

          {localReservation.extensionStatus === "Approved" && (
            <div>
              <span>Extension Approved</span>
            </div>
          )}

          <div>
            <div>
              <p>Date</p>
              <div>
                <p>{formatDateOnly(localReservation.datetime)}</p>
              </div>
            </div>

            <div>
              <p>Time</p>
              <div>
                <p>
                  {formatTimeOnly(localReservation.datetime)} - {formatTimeOnly(localReservation.endDatetime)}
                </p>
              </div>
            </div>
            
            <div>
              <p>Room</p>
              <div>
                <p>{localReservation.roomName}</p>
              </div>
            </div>
            
            <div>
              <p>Location</p>
              <div>
                <p>{localReservation.location}</p>
              </div>
            </div>
            
            <div>
              <p>Purpose</p>
              <div>
                <p>{localReservation.purpose}</p>
              </div>
            </div>
            
            <div>
              <p>Status</p>
              <div>
                {localReservation.status}
              </div>
            </div>
          </div>

          {/* Current Schedule */}
          <div>
            <h3>Current Schedule</h3>
            <div>
              <div>
                <p>Start Time:</p>
                <p>{formatTimeOnly(localReservation.datetime)}</p>
              </div>
              <div>
                <p>End Time:</p>
                <p>{formatTimeOnly(localReservation.endDatetime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div>
          <h2>Participants</h2>
          {loadingParticipants ? (
            <p>Loading participants...</p>
          ) : (
            <div>
              {participants.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>ID Number</th>
                      <th>Name</th>
                      <th>Course</th>
                      <th>Year Level</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr key={participant._id || index}>
                        <td>{participant.id_number || participant.idNumber || "N/A"}</td>
                        <td>{participant.name || "N/A"}</td>
                        <td>{participant.course || "N/A"}</td>
                        <td>{participant.year_level || participant.yearLevel || "N/A"}</td>
                        <td>{participant.department || "N/A"}</td>
                        <td>
                          {(isMainReserver || isStaffOrAdmin) && (
                            <button 
                              onClick={() => removeParticipant(participant._id)}
                              disabled={processingAction}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No participants added yet.</p>
              )}
            </div>
          )}

          {/* Add Participant Form */}
          {(isMainReserver || isStaffOrAdmin) && (
            <div>
              <h3>Add Participant</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const idNumber = formData.get('idNumber');
                
                try {
                  // First try to fetch user by ID number
                  const userData = await fetchUserByIdNumber(idNumber);
                  
                  // If user exists, add them as participant
                  await addParticipant({
                    id_number: userData.id_number,
                    name: userData.name,
                    course: userData.course,
                    year_level: userData.year_level,
                    department: userData.department
                  });
                  
                  setModalMessage("Participant added successfully!");
                  setShowResultModal(true);
                  e.target.reset();
                } catch (error) {
                  // If user not found, allow manual entry
                  const name = formData.get('name');
                  const course = formData.get('course');
                  const yearLevel = formData.get('yearLevel');
                  const department = formData.get('department');
                  
                  if (!name) {
                    setModalMessage("Please provide at least a name for the participant");
                    setShowResultModal(true);
                    return;
                  }
                  
                  await addParticipant({
                    id_number: idNumber,
                    name: name,
                    course: course,
                    year_level: yearLevel,
                    department: department
                  });
                  
                  setModalMessage("Participant added successfully!");
                  setShowResultModal(true);
                  e.target.reset();
                }
              }}>
                <div>
                  <label>ID Number:</label>
                  <input type="text" name="idNumber" placeholder="Enter ID number" />
                </div>
                <div>
                  <label>Name:</label>
                  <input type="text" name="name" placeholder="Enter name" />
                </div>
                <div>
                  <label>Course:</label>
                  <input type="text" name="course" placeholder="Enter course" />
                </div>
                <div>
                  <label>Year Level:</label>
                  <input type="text" name="yearLevel" placeholder="Enter year level" />
                </div>
                <div>
                  <label>Department:</label>
                  <input type="text" name="department" placeholder="Enter department" />
                </div>
                <button type="submit" disabled={processingAction}>
                  Add Participant
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div>
          {/* Staff/Admin Actions */}
          {isStaffOrAdmin && (
            <>
              {localReservation.status === "Pending" && (
                <>
                  <button
                    onClick={() => setShowApproveConfirm(true)}
                    disabled={processingAction === "approve"}
                  >
                    {processingAction === "approve" ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => setShowRejectConfirm(true)}
                    disabled={processingAction === "reject"}
                  >
                    {processingAction === "reject" ? "Rejecting..." : "Reject"}
                  </button>
                </>
              )}

              {localReservation.status === "Approved" && (
                <button
                  onClick={() => setShowStartConfirm(true)}
                  disabled={processingAction === "start"}
                >
                  {processingAction === "start" ? "Starting..." : "Start Reservation"}
                </button>
              )}

              {localReservation.status === "Ongoing" && (
                <>
                  <button
                    onClick={() => setShowEndEarlyConfirm(true)}
                    disabled={processingAction === "end-early"}
                  >
                    {processingAction === "end-early" ? "Ending..." : "End Early"}
                  </button>

                  {hasPendingExtension && (
                    <>
                      <button
                        onClick={() => setShowApproveExtensionConfirm(true)}
                        disabled={processingAction === "approve-extension"}
                      >
                        {processingAction === "approve-extension" ? "Approving..." : "Approve Extension"}
                      </button>
                      <button
                        onClick={() => setShowRejectExtensionConfirm(true)}
                        disabled={processingAction === "reject-extension"}
                      >
                        {processingAction === "reject-extension" ? "Rejecting..." : "Reject Extension"}
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* User Actions */}
          {isMainReserver && (
            <>
              {["Pending", "Approved"].includes(localReservation.status) && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={cancelling || processingAction}
                >
                  {cancelling ? "Cancelling..." : "Cancel Reservation"}
                </button>
              )}

              {localReservation.status === "Ongoing" && (
                <button
                  onClick={() => setShowEndEarlyConfirm(true)}
                  disabled={processingAction === "end-early"}
                >
                  {processingAction === "end-early" ? "Ending..." : "End Early"}
                </button>
              )}

              {canRequestExtension && (
                <button
                  onClick={handleShowExtendModal}
                  disabled={processingAction}
                >
                  Request Extension
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* All modals remain the same as previous version */}
      {showCancelConfirm && (
        <div>
          <div>
            <h3>Cancel Reservation</h3>
            <p>Are you sure you want to cancel this reservation? This action cannot be undone.</p>
            <div>
              <button onClick={() => setShowCancelConfirm(false)}>
                No, Keep It
              </button>
              <button onClick={cancelReservation} disabled={cancelling}>
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndEarlyConfirm && (
        <div>
          <div>
            <h3>End Reservation Early</h3>
            <p>Are you sure you want to end this reservation early?</p>
            <div>
              <button onClick={() => setShowEndEarlyConfirm(false)}>
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAction("end-early");
                  setShowEndEarlyConfirm(false);
                }}
                disabled={processingAction === "end-early"}
              >
                {processingAction === "end-early" ? "Ending..." : "Yes, End Early"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ... other modals remain the same ... */}

      {showResultModal && (
        <div>
          <div>
            <h3>Action Result</h3>
            <p>{modalMessage}</p>
            <div>
              <button onClick={handleResultModalClose}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showExtendModal && (
        <div>
          <div>
            <h3>Request Time Extension</h3>
            
            <div>
              <div>
                <p>Continuous Extension System</p>
                <p>
                  Your reservation will continue automatically until you end it, staff ends it, or until the next reservation starts.
                </p>
              </div>

              <div>
                <label>Current Schedule</label>
                <div>
                  <div>
                    <span>Start:</span>
                    <span>{formatTimeOnly(localReservation.datetime)}</span>
                  </div>
                  <div>
                    <span>End:</span>
                    <span>{formatTimeOnly(localReservation.endDatetime)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label>Reason for Extension (Optional)</label>
                <textarea
                  placeholder="Why do you need continuous extension?"
                  rows="3"
                />
              </div>
            </div>

            <div>
              <button onClick={() => setShowExtendModal(false)}>
                Cancel
              </button>
              <button
                onClick={handleExtendSubmit}
                disabled={processingAction === "request-extension"}
              >
                {processingAction === "request-extension" ? "Requesting..." : "Start Continuous Extension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationDetails;