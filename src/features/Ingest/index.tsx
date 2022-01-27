import { AliRTS, LocalStream, RtsClient } from "aliyun-rts-sdk";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  const [aliRts, setAliRts] = useState<RtsClient>(AliRTS.createClient({}));
  const [statusStream, setStatusStream] = useState<StatusStream>(
    StatusStream.ended
  );
  const [audioConfig, setAudioConfig] = useState(true);
  const [cameraConfig, setCameraConfig] = useState(false);
  const [videoR, setVideoR] = useState<any>(null);

  useEffect(() => {
    setVideoR(document.getElementById("video"));
  }, []);

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
    return () => {
      localStream?.stop();
      aliRts.unpublish();
    };
  }, [aliRts, localStream]);

  useEffect(() => {
    if (localStream) {
      console.log({ audioConfig });
      if (audioConfig) {
        localStream.enableAudio();
      } else {
        localStream.disableAudio();
      }
    }
  }, [audioConfig, localStream]);

  useEffect(() => {
    if (localStream) {
      console.log({ cameraConfig });
      if (cameraConfig) {
        localStream.enableVideo();
      } else {
        localStream.disableVideo();
      }
    }
  }, [cameraConfig, localStream]);

  const MediaElement = useMemo(() => {
    return <video width={500} height={300} id="video" controls muted></video>;
  }, []);

  const upsertIngestStream = useCallback(() => {
    setStatusStream(StatusStream.connecting);
    AliRTS.createStream({
      audio: true,
      video: cameraConfig,
      screen: false,
    })
      .then((stream) => {
        stream.enableAudio()
        // Preview the content of the ingested stream. The mediaElement parameter indicates the media type of the stream. Valid values of the mediaElement parameter: audio and video.
        setLocalStream(stream);
        console.log(stream);

        setStatusStream(StatusStream.connected);
        if (stream && stream.audioTrack) {
          stream.play(videoR);
        }
      })
      .catch((err) => {
        console.error("createStream", err);
        setStatusStream(StatusStream.ended);
        alert(err.message);
        // The local stream failed to be added.
      });
  }, [cameraConfig, videoR]);

  const startOrRestartIngestStream = useCallback(() => {
    if (localStream) {
      aliRts
        .publish(host, localStream)
        .then(() => {
          // The stream is ingested.
          setStatusStream(StatusStream.started);

          console.log("published");
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
      await aliRts.unpublish();
      setStatusStream(StatusStream.ended);
      localStream?.stop();
      videoR.srcObject = null;
    } catch (err: any) {
      console.error("unpublish", err);
      alert(err?.message);
    }
  }, [aliRts, localStream, videoR]);

  const stopInges = useCallback(async () => {
    try {
      localStream?.stop();
      videoR.srcObject = null;
    } catch (err: any) {
      console.error("unpublish", err);
      alert(err?.message);
    }
  }, [localStream, videoR]);

  return (
    <div>
      <div>
        <h1>Ingest</h1>
      </div>
      <div>
        <textarea
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
        onChange={(e) => setAudioConfig(e.target.checked)}
      />
      <label htmlFor={"camera"}>Camera</label>
      <input
        id="camera"
        type={"checkbox"}
        checked={cameraConfig}
        onChange={(e) => {
          setCameraConfig(e.target.checked);
        }}
      />

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
        <button
          onClick={() => {
            stopInges();
          }}
        >
          Stop
        </button>
      </div>
      <div>{MediaElement}</div>
    </div>
  );
});
