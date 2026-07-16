import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// IMPORTANT: Remplacez ces valeurs par vos identifiants Supabase
// (Disponibles dans Project Settings > API)
const SUPABASE_URL = 'VOTRE_SUPABASE_URL_ICI';
const SUPABASE_ANON_KEY = 'VOTRE_SUPABASE_ANON_KEY_ICI';

// Initialisation du client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
