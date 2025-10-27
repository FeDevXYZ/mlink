// Costanti condivise dell'applicazione

// Codice speciale per descrizioni vuote
// Quando un post viene creato senza descrizione, questo codice viene salvato su Supabase
// Quando viene letto, viene convertito in stringa vuota per il client
export const EMPTY_DESCRIPTION_CODE = '__EMPTY_DESCRIPTION__';

// Codici admin
export const ADMIN_CODE = 'J';
export const SUPERADMIN_CODE = 'SUPERADMIN2024';

// Utilità per gestire descrizioni vuote
export function encodeEmptyDescription(content: string): string {
  return (!content || content.trim() === '') ? EMPTY_DESCRIPTION_CODE : content;
}

export function decodeEmptyDescription(content: string): string {
  return content === EMPTY_DESCRIPTION_CODE ? '' : content;
}
