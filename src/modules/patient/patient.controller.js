import { bookAppointmentModel, cancelAppointmentModel, getMyAppointmentsModel, getPatientDashboardModel, getPatientPrescriptionsModel } from "./patient.model.js";

export const patientDashboard = async (req, res) => {
  try {
    const data = await getPatientDashboardModel(req.user.id);

    if (!data)
      return res.status(404).json({ message: "Patient not found" });

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const bookAppointment = async (req, res) => {
  try {
    const { doctor_id, date, time, reason } = req.body;

    if (!doctor_id || !date || !time)
      return res.status(400).json({ message: "Doctor, date & time required" });

    const result = await bookAppointmentModel(
      req.user.id,
      doctor_id,
      date,
      time,
      reason
    );

    if (result === "PATIENT_NOT_FOUND")
      return res.status(404).json({ message: "Patient not found" });

    if (result === "DOCTOR_NOT_FOUND")
      return res.status(404).json({ message: "Doctor not found" });

    if (result === "SLOT_BOOKED")
      return res.status(400).json({ message: "Slot already booked" });

    res.json({ message: "Appointment booked successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const myAppointments = async (req, res) => {
  try {
    const data = await getMyAppointmentsModel(req.user.id);

    if (!data)
      return res.status(404).json({ message: "Patient not found" });

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const data = await getPatientPrescriptionsModel(req.user.id);

    if (!data)
      return res.status(404).json({ message: "No prescriptions found" });

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const result = await cancelAppointmentModel(req.params.id, req.user.id);

    if (result === "PATIENT_NOT_FOUND")
      return res.status(404).json({ message: "Patient not found" });

    if (result === "NOT_YOURS")
      return res.status(403).json({ message: "This appointment not yours" });

    if (result === "CANNOT_CANCEL")
      return res.status(400).json({ message: "Cannot cancel approved/completed appointment" });

    res.json({ message: "Appointment cancelled successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};