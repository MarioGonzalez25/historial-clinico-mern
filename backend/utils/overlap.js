// backend/utils/overlap.js
export async function haySolape(Cita, { doctorId, patientId, inicio, fin, excludeId = null }) {
  const q = {
    isDeleted: false,
    $or: [{ doctorId }, { patientId }],
    inicio: { $lt: fin },
    fin:    { $gt: inicio }
  };
  if (excludeId) q._id = { $ne: excludeId };
  const count = await Cita.countDocuments(q);
  return count > 0;
}
