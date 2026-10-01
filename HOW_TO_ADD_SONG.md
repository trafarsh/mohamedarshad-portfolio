# How to Add Songs to the Spotify App

The Spotify app plays MP3 files from the `public` folder as a small playlist.

## Step 1: Add the MP3 File

Put the file directly in the `public` folder (not in a subfolder), e.g. `public/my-song.mp3`.

Optionally add a square cover image too, e.g. `public/my-song-cover.png`.

## Step 2: Add It to the Playlist

Open `components/apps/spotify.tsx` and add an entry to the `playlist` array:

```ts
const playlist: Track[] = [
  // ...existing songs
  {
    title: "My Song",
    artist: "Artist Name",
    album: "Album Name",
    file: "/my-song.mp3",
    cover: "/my-song-cover.png", // optional — a gradient is shown if omitted
  },
]
```

## Step 3: Restart the Dev Server

```bash
npm run dev
```

The song now appears under **Up Next**, and the previous/next buttons cycle through the playlist.

> Only publish music you have the rights to share.
