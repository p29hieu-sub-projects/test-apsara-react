import { AliRTS, LocalStream, RtsClient } from "aliyun-rts-sdk";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import "./index.css";

enum StatusStream {
  connecting = "connecting",
  connected = "connected",
  started = "started",
  ended = "ended",
}

export default memo(() => {
  const [host, setHost] = useState("");
  const [localStream, setLocalStream] = useState<LocalStream>();
  const aliRts: RtsClient = AliRTS.createClient({});
  const [statusStream, setStatusStream] = useState<StatusStream>(
    StatusStream.ended
  );
  const [audioConfig, setAudioConfig] = useState(true);
  const [cameraConfig, setCameraConfig] = useState(false);
  const [screenConfig, setScreenConfig] = useState(false);

  useEffect(() => {
    aliRts
      .isSupport({
        isReceiveVideo: true,
      })
      .then((re) => {
        // The browser is available.
      })
      .catch((err) => {
        // The browser is unavailable.
        alert(`not support errorCode: ${err.errorCode}`);
        alert(`not support message: ${err.message}`);
      });
  }, [aliRts]);

  useEffect(() => {
    return () => {
      console.log("STOP ALL");
    //   localStream?.stop();
    //   aliRts.unpublish();
    };
  }, [aliRts, localStream]);

  const updateAudioConfig = useCallback(
    (enabled) => {
      setAudioConfig(enabled);
      console.log({ audioConfig: enabled });
      if (localStream) {
        if (enabled) {
          localStream.enableAudio();
        } else {
          localStream.disableAudio();
        }
      }
    },
    [localStream]
  );

  const updateCameraConfig = useCallback(
    (enabled) => {
      setCameraConfig(enabled);
      console.log({ cameraConfig: enabled });
      if (localStream) {
        if (enabled) {
          localStream.enableVideo();
        } else {
          localStream.disableVideo();
        }
      }
    },
    [localStream]
  );

  const MediaElement = useMemo(() => {
    return <video width={500} height={300} autoPlay={true} />;
  }, []);

  const upsertIngestStream = useCallback(() => {
    setStatusStream(StatusStream.connecting);
    AliRTS.createStream({
      audio: audioConfig,
      video: cameraConfig,
      screen: screenConfig,
    })
      .then((stream) => {
        // Preview the content of the ingested stream. The mediaElement parameter indicates the media type of the stream. Valid values of the mediaElement parameter: audio and video.
        setLocalStream(stream);
        setStatusStream(StatusStream.connected);
        // localStream?.play(MediaElement as any);
      })
      .catch((err) => {
        console.error("createStream", err);
        setStatusStream(StatusStream.ended);
        alert(err.message);
        // The local stream failed to be added.
      });
  }, [audioConfig, cameraConfig, screenConfig]);

  const startOrRestartIngestStream = useCallback(() => {
    if (localStream) {
      aliRts
        .publish(host, localStream)
        .then(() => {
          // The stream is ingested.
          setStatusStream(StatusStream.started);
        })
        .catch((err) => {
          // The stream failed to be ingested.
          console.error("publish", err);
          setStatusStream(StatusStream.ended);
          alert(err.message);
        });
    }
  }, [host, localStream, aliRts]);

  const stopIngestStream = useCallback(async () => {
    try {
      localStream?.stop();
      await aliRts.unpublish();
      setStatusStream(StatusStream.ended);
    } catch (err: any) {
      console.error("unpublish", err);
      alert(err?.message);
    }
  }, [aliRts, localStream]);

  return (
    <div>
      <div>
        <h1>Ingest</h1>
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
      <br />

      <label htmlFor={"audio"}>Audio</label>
      <input
        id="audio"
        type={"checkbox"}
        checked={audioConfig}
        onChange={(e) => {
          updateAudioConfig(e.target.checked);
        }}
      />
      {[StatusStream.ended, StatusStream.connected].includes(statusStream) && (
        <>
          <label htmlFor={"camera"}>Camera</label>
          <input
            id="camera"
            type={"checkbox"}
            checked={cameraConfig}
            onChange={(e) => {
              updateCameraConfig(e.target.checked);
            }}
          />
          <label htmlFor={"screen"}>Share Screen</label>
          <input
            id="screen"
            type={"checkbox"}
            checked={screenConfig}
            onChange={(e) => {
              setScreenConfig(e.target.checked);
            }}
          />
        </>
      )}

      {statusStream === StatusStream.connecting && <div>Connecting...</div>}
      <div>videoTrack: {localStream?.videoTrack?.muted}</div>
      <div>audioTrack: {localStream?.audioTrack?.muted}</div>
      <div>
        {[
          StatusStream.ended,
          StatusStream.connecting,
          StatusStream.connected,
        ].includes(statusStream) && (
          <button
            onClick={() => {
              upsertIngestStream();
            }}
          >
            {localStream ? "Update" : "Add"} Stream
          </button>
        )}
        {localStream &&
          [StatusStream.ended, StatusStream.connected].includes(
            statusStream
          ) && (
            <button
              onClick={() => {
                startOrRestartIngestStream();
              }}
            >
              Start
            </button>
          )}
        {statusStream === StatusStream.started && (
          <button
            onClick={() => {
              stopIngestStream();
            }}
          >
            Pause
          </button>
        )}
      </div>
      <div>{MediaElement}</div>
    </div>
  );
});
