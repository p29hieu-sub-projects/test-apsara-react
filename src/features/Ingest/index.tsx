import { AliRTS, LocalStream, RtsClient } from "aliyun-rts-sdk";
import React, {
  memo,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

enum StatusStream {
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

  const Hls = useMemo(() => {
    if (host) {
      // return (
      //   <ReactHlsPlayer
      //     playerRef={playerRef.current as any}
      //     src={host}
      //     autoPlay={false}
      //     controls={true}
      //     width="100%"
      //     height="auto"
      //   />
      // );
    }
    return <div></div>;
  }, [host]);

  const MediaElement = useMemo(() => {
    return <video width={500} height={300}></video>;
  }, []);

  const addIngestStream = useCallback(() => {
    AliRTS.createStream({
      audio: true,
      video: false,
      screen: true,
    })
      .then((stream) => {
        // Preview the content of the ingested stream. The mediaElement parameter indicates the media type of the stream. Valid values of the mediaElement parameter: audio and video.
        setLocalStream(stream);
        // localStream.play(MediaElement as any);
      })
      .catch((err) => {
        console.error("createStream", err);
        // The local stream failed to be added.
      });
  }, []);

  const startIngestStream = useCallback(() => {
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
        });
    }
  }, [host, localStream, aliRts]);

  const stopIngestStream = useCallback(async () => {
    try {
      await aliRts.unpublish();
      setStatusStream(StatusStream.ended);
    } catch (err) {
      console.error("unpublish", err);
    }
  }, [aliRts]);

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
      <div>
        {statusStream === StatusStream.ended && (
          <button
            onClick={() => {
              addIngestStream();
            }}
          >
            Add Stream
          </button>
        )}
        {localStream && statusStream === StatusStream.ended && (
          <button
            onClick={() => {
              startIngestStream();
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
      <div>{Hls}</div>
      <div>{MediaElement}</div>
    </div>
  );
});
