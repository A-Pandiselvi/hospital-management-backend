import { addPrescriptionModel, getDoctorAppointmentsModel, getDoctorDashboardModel, updateAppointmentStatusModel } from "./doctor.model.js";

export const doctorDashboard = async (req, res) => {
  try {
    const data = await getDoctorDashboardModel(req.user.id);

    if (!data)
      return res.status(404).json({ message: "Doctor profile not found" });

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const doctorAppointments = async (req, res) => {
  try {
    const data = await getDoctorAppointmentsModel(req.user.id);

    if (!data)
      return res.status(404).json({ message: "Doctor not found" });

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const allowed = ["approved", "rejected", "completed"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const result = await updateAppointmentStatusModel(id, req.user.id, status);

    if (result === "DOCTOR_NOT_FOUND")
      return res.status(404).json({ message: "Doctor not found" });

    if (result === "NOT_ALLOWED")
      return res.status(403).json({ message: "This appointment not yours" });

    res.json({ message: "Appointment status updated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addPrescription = async (req, res) => {
  try {
    const { appointment_id, medicines, notes } = req.body;

    if (!appointment_id || !medicines)
      return res.status(400).json({ message: "Appointment and medicines required" });

    const result = await addPrescriptionModel(
      req.user.id,
      appointment_id,
      medicines,
      notes
    );

    if (result === "DOCTOR_NOT_FOUND")
      return res.status(404).json({ message: "Doctor not found" });

    if (result === "NOT_YOURS")
      return res.status(403).json({ message: "Not your appointment" });

    if (result === "NOT_COMPLETED")
      return res.status(400).json({ message: "Complete appointment first" });

    res.json({ message: "Prescription added successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

