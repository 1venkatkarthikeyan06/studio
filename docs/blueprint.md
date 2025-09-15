# **App Name**: Interview Anonymizer

## Core Features:

- Video Upload: Allow users to upload video files of interviews.
- Transcription: Automatically transcribe the video content into text using speech-to-text technology.
- NER Processing: Run a Named Entity Recognition (NER) model tool to detect sensitive information in the transcribed text (names, ages, contact info, locations, etc.).
- Anonymization: Replace detected sensitive entities with unique random identifiers to anonymize the interview transcript.
- Transcript Display: Display both the original and anonymized transcripts in a side-by-side view.
- Entity Mapping: Generate and securely store an entity mapping table that links original entities to their random identifiers.
- Download: Offer options to download the anonymized transcript, and the mapping table (with appropriate access controls).

## Style Guidelines:

- Primary color: Moderate blue (#5DADE2) to convey trust and professionalism.
- Background color: Light gray (#F0F0F0) for a clean, neutral interface.
- Accent color: Soft orange (#F39C12) for highlighting actions and key elements; helps draw attention without being distracting.
- Body font: 'PT Sans', a modern humanist sans-serif, suitable for longer blocks of text, for readability of interview transcripts.
- Headline font: 'Space Grotesk', for titles; works well with PT Sans for body text.
- Use simple, consistent icons for upload, download, and other actions.
- Clean and structured layout for displaying original and anonymized transcripts side by side.