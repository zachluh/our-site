import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const SpotifyEmbed = (uri) => {
  return (
    <div className="m-0 p-0">
      <iframe
        src={`https://open.spotify.com/embed/track/${uri}`}
        width="100%"
        height="500"
        frameBorder="0"
        allow="encrypted-media"
        title="Spotify Embed"
        style={{borderRadius:'0'}}
      ></iframe>
    </div>
  );
};

export default SpotifyEmbed;