import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  writeBatch, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwTFKoFiJUCD1bZ44b6NO-soLzniEuD90",
  authDomain: "h2-mechanic-corp.firebaseapp.com",
  projectId: "h2-mechanic-corp",
  storageBucket: "h2-mechanic-corp.firebasestorage.app",
  messagingSenderId: "1062475887277",
  appId: "1:1062475887277:web:001506892a8ead860f4c24",
  measurementId: "G-NHCF5PS80S"
};

// Initialisation
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Helper: Adds N hours to a "HH:00" string and returns the new time string.
 */
function addHoursToTime(timeStr, hoursToAdd) {
  const [hourStr, minuteStr] = timeStr.split(':');
  const newHour = parseInt(hourStr, 10) + hoursToAdd;
  // Format as "HH:MM" (e.g., "09:00", "14:00")
  return `${newHour.toString().padStart(2, '0')}:${minuteStr}`;
}

/**
 * Fonction pour réserver un créneau (ou plusieurs si duration > 1).
 * Écrit dans `public_slots` (public) et `appointments` (privé) via une transaction batch.
 * 
 * @param {Object} data - Les données du formulaire
 */
export async function bookAppointment(data) {
  const { 
    service, 
    appointmentDate, 
    appointmentTime, 
    clientName, 
    clientPhone, 
    clientEmail, 
    vehicleInfo,
    durationHours = 1 // Default to 1 hour
  } = data;

  try {
    // 1. Calculate all time slots needed based on duration
    const requiredTimes = [];
    for (let i = 0; i < durationHours; i++) {
      requiredTimes.push(addHoursToTime(appointmentTime, i));
    }

    // 2. Vérification anti-doublon pour TOUS les créneaux nécessaires
    const slotsRef = collection(db, "public_slots");
    const q = query(
      slotsRef, 
      where("appointmentDate", "==", appointmentDate)
    );
    const querySnapshot = await getDocs(q);

    // Filter to see if any required time is already taken (ignoring cancelled slots)
    const existingTimes = [];
    querySnapshot.forEach(doc => {
      const d = doc.data();
      if (d.status !== "cancelled") {
        existingTimes.push(d.appointmentTime);
      }
    });

    const conflict = requiredTimes.find(time => existingTimes.includes(time));
    if (conflict) {
      throw new Error(`Le créneau de ${conflict} est déjà réservé. Veuillez choisir un autre horaire ou réduire la durée.`);
    }

    // 3. Création d'un Batch pour écrire dans les deux collections
    const batch = writeBatch(db);

    // On génère un ID unique pour le rendez-vous principal
    const newDocRef = doc(collection(db, "appointments")); 
    const sharedId = newDocRef.id;

    // Écriture de chaque slot public
    requiredTimes.forEach((time, index) => {
      // Use a composite ID for slots: appointmentId_index
      const publicSlotRef = doc(db, "public_slots", `${sharedId}_${index}`);
      batch.set(publicSlotRef, {
        appointmentId: sharedId, // Link back to parent
        appointmentDate,
        appointmentTime: time,
        status: "confirmed",
        createdAt: serverTimestamp()
      });
    });

    // Écriture des détails du rendez-vous
    batch.set(newDocRef, {
      service,
      appointmentDate,
      appointmentTime,
      durationHours,
      clientName,
      clientPhone,
      clientEmail,
      vehicleInfo,
      status: "confirmed",
      createdAt: serverTimestamp()
    });

    // 4. Exécution du Batch
    await batch.commit();
    return { success: true, id: sharedId };

  } catch (error) {
    console.error("Erreur lors de la réservation :", error);
    return { success: false, error: error.message };
  }
}
