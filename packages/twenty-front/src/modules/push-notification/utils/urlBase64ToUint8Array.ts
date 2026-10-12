// Safari and older Firefox reject a base64url string as applicationServerKey
export const urlBase64ToUint8Array = (
  base64Url: string,
): Uint8Array<ArrayBuffer> => {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
};
