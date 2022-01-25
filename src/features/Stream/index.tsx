import React, { memo, RefObject, useMemo, useRef, useState } from "react";
import ReactHlsPlayer from "react-hls-player";

export default memo(() => {
  const [host, setHost] = useState("");
  const playerRef = useRef<RefObject<HTMLVideoElement>>();

  const Hls = useMemo(() => {
    if (host) {
      return (
        <ReactHlsPlayer
          playerRef={playerRef.current as any}
          src={host}
          autoPlay={true}
          controls={true}
          muted={false}
        />
      );
    }
    return <div></div>;
  }, [host]);
  return (
    <div>
      <div>
        <h1>Stream</h1>
      </div>
      <div>
        <textarea
          style={{
            width: "100%",
          }}
          rows={3}
          onChange={(e) => {
            setHost(e.target.value);
          }}
        ></textarea>
      </div>
      <div></div>
      <div style={{
        margin: "15px"
      }}>{Hls}</div>
    </div>
  );
});
