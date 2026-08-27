These three recordings are the French demo calls played on /demonstration.

  appel-1-urgence-chauffe-eau.wav
  appel-2-zone-verifiee.wav
  appel-3-prise-rdv-fuite.wav

They are declared in the REC array inside demonstration.html itself, in the
inline script near the bottom of the file. There is no separate player
script. An earlier version of this note pointed at assets/js/demo-player.js,
which does not exist.

If a file is missing, its player renders greyed out and disabled instead of
breaking the page.

WAV and MP3 both play in every current browser. These WAVs are large, 5 MB
to 10 MB each, so prefer MP3 for any replacement. If you change a file
extension, update the matching s: value in the REC array.

The English page, demonstration-en.html, must not use these files. Its REC
array is deliberately empty until English recordings exist. See the
TODO(asset) markers in that file.
