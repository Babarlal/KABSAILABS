Drop the 3 démonstration recordings in THIS folder, with these exact names
(they are referenced by /demonstration via assets/js/demo-player.js):

  appel-1-urgence-chauffe-eau.wav
  appel-2-zone-verifiee.wav
  appel-3-prise-rdv-fuite.wav

WAV and MP3 both play fine in the browser. If you swap to .mp3, update the
`src` values in the RECORDINGS array at the top of assets/js/demo-player.js.

If a file is missing, its player renders disabled (greyed out) instead of
crashing the page.
