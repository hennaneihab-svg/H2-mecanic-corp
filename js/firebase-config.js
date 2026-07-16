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
 * Fonction pour réserver un créneau en évitant les doublons.
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
    vehicleInfo 
  } = data;

  try {
    // 1. Vérification anti-doublon dans `public_slots`
    const slotsRef = collection(db, "public_slots");
    const q = query(
      slotsRef, 
      where("appointmentDate", "==", appointmentDate),
      where("appointmentTime", "==", appointmentTime)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error("Ce créneau est déjà réservé. Veuillez en choisir un autre.");
    }

    // 2. Création d'un Batch pour écrire dans les deux collections simultanément
    const batch = writeBatch(db);

    // On génère un ID unique pour lier le créneau public et les infos privées
    const newDocRef = doc(collection(db, "appointments")); 
    const sharedId = newDocRef.id;

    // Référence pour le slot public
    const publicSlotRef = doc(db, "public_slots", sharedId);
    
    // Écriture du slot public (données non sensibles)
    batch.set(publicSlotRef, {
      appointmentDate,
      appointmentTime,
      status: "confirmed",
      createdAt: serverTimestamp()
    });

    // Écriture des détails du rendez-vous (données sensibles, protégées par Firebase Rules)
    batch.set(newDocRef, {
      service,
      appointmentDate,
      appointmentTime,
      clientName,
      clientPhone,
      clientEmail,
      vehicleInfo,
      status: "confirmed",
      createdAt: serverTimestamp()
    });

    // 3. Exécution du Batch
    await batch.commit();
    return { success: true, id: sharedId };

  } catch (error) {
    console.error("Erreur lors de la réservation :", error);
    return { success: false, error: error.message };
  }
}
