import React, { useRef, useState, useCallback, createRef } from "react";
import "./App.css";
import "./index.css";
import Webcam from "react-webcam";
import axios from "axios";
import { Header, Grid, Button, Icon, Message, Loader } from "semantic-ui-react";

function App() {
  const webcamRef = useRef(null);
  const utteranceRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [textOcr, setTextOcr] = useState(null);
  const [load, setLoad] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [speechInProgress, setSpeechInProgress] = useState(false);
  let fileInputRef = createRef();

  // Function to handle speech synthesis
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utteranceRef.current = utterance;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    setButtonDisabled(false);
  };

  // Function to handle pausing speech synthesis
  const pauseSpeech = () => {
    speechSynthesis.pause();
  };

  // Function to handle resuming speech synthesis
  const resumeSpeech = () => {
    if (utteranceRef.current) {
      speechSynthesis.resume();

      setSpeechInProgress(true); // Set speech in progress
    } else {
      alert("Nothing To Resume");
      setButtonDisabled(true);

      // Disable the button
    }
  };

  const capture = useCallback(() => {
    setLoad(true);
    const imageSrc = webcamRef.current.getScreenshot();
    let url = "http://localhost:5000/capture";
    let config = {
      headers: { "Content-Type": "application/json" },
    };
    let dataBody = {
      img: imageSrc,
    };
    axios
      .post(url, dataBody, config)
      .then((res) => {
        setTextOcr(res.data.text);
        setImgSrc(imageSrc);
        setLoad(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [webcamRef, setImgSrc]);

  const upload = async (file) => {
    setLoad(true);
    var url = "http://localhost:5000/upload";
    var formData = new FormData();
    formData.append("file", file);
    var config = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    await axios.post(url, formData, config).then((res) => {
      setTextOcr(res.data.text);
      setImgSrc(res.data.image);
      setLoad(false);
      utteranceRef.current = null;
    });
  };

  const handleOnChangeFile = (e) => {
    const file = e.target.files[0];
    upload(file);
  };

  return (
    <>
    <div className="flex flex-col  hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div className="">
        <Header
          style={{ fontSize: 50, fontFamily: "roboto" }}
          size="huge"
          className="text-center"
        >
          React OCR
        </Header>
      </div>

      <Grid divided>
        <Grid.Column
          style={{ width: "50%" }}
          key={0}
          className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
        >
          <center>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
            />
            <Grid.Column>
              <Button
                size="big"
                onClick={capture}
                style={{ margin: 20 }}
                icon
                labelPosition="left"
                inverted
                color="green"
              >
                <Icon name="camera" />
                Capture
              </Button>

              <Button
                size="big"
                onClick={() => fileInputRef.current.click()}
                style={{ margin: 20 }}
                icon
                labelPosition="left"
                inverted
                color="blue"
              >
                <Icon name="upload" />
                Upload
                <form encType="multipart/form-data">
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    name="filename"
                    onChange={handleOnChangeFile}
                    accept="image/*"
                  />
                </form>
              </Button>

              {/* Integration of speech synthesis buttons */}
            </Grid.Column>
          </center>
        </Grid.Column>

        <Grid.Column style={{ width: "50%" }} key={1}>
          {load ? (
            <Loader
              style={{ marginTop: 120 }}
              active
              inline="centered"
              size="big"
            >
              Loading...
            </Loader>
          ) : imgSrc ? (
            <>
              <div className="flex flex-col justify-between p-4 leading-normal ">
                <Header
                  style={{ margin: 10, fontFamily: "roboto" }}
                  size="large"
                  className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
                >
                  Result
                </Header>
                <img
                  style={{ marginLeft: 10, height: "50%" }}
                  alt="captured"
                  src={imgSrc}
                />
                <Message
                className="mb-3 font-normal text-gray-700 dark:text-gray-400"
                  size="massive"
                  color="orange"
                  header={textOcr}
                  content=""
                  style={{ margin: 15 }}
                  
                />
              </div>
            </>
          ) : (
            <Header style={{ margin: 10, fontFamily: "roboto" }} size="large">
              No data preview
            </Header>
          )}
        </Grid.Column>
      </Grid>
      <div style={{ marginTop: 20 }}>
        <Button onClick={() => speak(textOcr)}>Play</Button>
        <Button onClick={pauseSpeech}>Pause</Button>
        <Button onClick={resumeSpeech} disabled={isButtonDisabled}>
          Resume
        </Button>
      </div>
      </div>
    </>
  );
}

export default App;
