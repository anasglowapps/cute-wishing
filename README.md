# Cute Wishing — Readability Fix

This is the fixed existing Cute Wishing project.

## What was fixed
- Removed browser `alert`, `confirm`, and `prompt` usage.
- Added an in-page themed link-ready modal.
- Added animated copy-success toast.
- Reworked contrast, card backgrounds, inputs, placeholders and buttons.
- Removed full-page dimming from normal creator UI.
- Background/particles are behind content and use `pointer-events:none`.
- Modal backdrop dims only the area behind the modal; modal content remains bright.
- Mobile layout is intentionally one-column and safe-area aware.
- Creator fields remain empty until the user enters data.
- No preset personal names/dates/messages.
- Existing encoded URL/hash flow remains intact.
- Receiver links open the cinematic experience directly.
- Invalid/missing wish hashes fall back to the creator.

## Run
Open `index.html` in Acode or Android Chrome.

For a public URL, upload the folder to static hosting. The basic creator and receiver experience does not need a backend.

### Bundled music
The project includes `birthday-song.m4a`, the user-provided birthday song. It starts only after the recipient taps **OPEN THE SURPRISE** (or the music control), respecting mobile autoplay restrictions. If the browser cannot play the file, the visual experience continues normally.
