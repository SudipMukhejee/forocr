import React, { useRef, useState, useCallback, createRef } from 'react';
import './App.css';
import Webcam from "react-webcam";
import axios from 'axios';
import { Header, Grid, Button, Icon, Message, Loader } from 'semantic-ui-react';

function App() {

  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [textOcr, setTextOcr] = useState(null);
  const [load, setLoad] = useState(false);
  const [reading, setReading] = useState(false); // State to track reading status
  const [utterance, setUtterance] = useState(null); // State to hold the speech utterance
  const fileInputRef = createRef();

  // Function to start reading the text
  const startReading = () => {
    if (utterance) {
      // If utterance exists (paused previously), resume from where it left off
      window.speechSynthesis.resume(utterance);
    } else {
      const speech = new SpeechSynthesisUtterance(textOcr);
      window.speechSynthesis.speak(speech);
      setUtterance(speech);
    }
    setReading(true);
  };

  // Function to pause reading the text
  const pauseReading = () => {
    if (utterance) {
      window.speechSynthesis.pause(utterance);
    }
    setReading(false);
  };

  const capture = useCallback(() => {
    setLoad(true);
    const imageSrc = webcamRef.current.getScreenshot();
    let url = 'http://localhost:5000/capture';
    let config = {
      headers: {'Content-Type': 'application/json'}
    };
    let dataBody = {
      img: imageSrc
    };
    axios.post(url, dataBody, config)
      .then((res) => {
        setTextOcr(res.data.text);
        setImgSrc(imageSrc);
        setLoad(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [webcamRef, setImgSrc]);

  const upload = (file) => {
    setLoad(true);
    var url = 'http://localhost:5000/upload';
    var formData = new FormData();
    formData.append('file', file);
    var config = {
      headers: {'Content-Type': 'multipart/form-data'}
    };
    return axios.post(url, formData, config)
      .then((res) => {
        setTextOcr(res.data.text);
        setImgSrc(res.data.image);
        setLoad(false);
      });
  };

  return (
    <>
      <center>
        <Header style={{ margin: 40, fontSize: 50, fontFamily: 'roboto' }} size='huge'>
          React OCR
        </Header>
      </center>

      <Grid divided>
        <Grid.Column style={{ width: "50%" }} key={0}>
          <center>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
            />
            <Grid.Column>
              <Button size='big' onClick={capture}
                style={{ margin: 20 }} icon labelPosition='left' inverted color='green'>
                <Icon name='camera' />
                Capture
              </Button>

              <Button size='big' onClick={() => fileInputRef.current.click()}
                style={{ margin: 20 }} icon labelPosition='left' inverted color='blue'>
                <Icon name='upload' />
                Upload
                <form encType="multipart/form-data">
                  <input ref={fileInputRef} type='file' hidden name='filename'
                    onChange={(x) => { upload(x.target.files[0]) }}
                    accept="image/*"
                  />
                </form>
              </Button>
              
            </Grid.Column>
          </center>
        </Grid.Column>

        <Grid.Column style={{ width: "50%" }} key={1}>
          {
            load
              ?
              <Loader style={{ marginTop: 120 }} active inline='centered' size='big'>Loading...</Loader>
              :
              (
                imgSrc
                  ?
                  <>
                    <Header style={{ margin: 10, fontFamily: 'roboto' }} size='large'>
                      Result
                    </Header>
                    <img style={{ marginLeft: 10, height: '50%' }} alt="captured" src={imgSrc} />
                    <Message
                      size='massive'
                      color='orange'
                      header={textOcr}
                      content=""
                      style={{ margin: 15 }}
                    />
                    {/* Button for reading the entire text */}
                    <Button
                      size='big'
                      onClick={reading ? pauseReading : startReading}
                      icon
                      labelPosition='left'
                      inverted
                      color={reading ? 'red' : 'green'}
                      style={{ margin: 20 }}
                    >
                      <Icon name={reading ? 'pause' : 'play'} />
                      {reading ? 'Pause Reading' : 'Start Reading'}
                    </Button>
                  </>
                  :
                  <Header style={{ margin: 10, fontFamily: 'roboto' }} size='large'>
                    No data preview
                  </Header>
              )
          }
        </Grid.Column>
      </Grid>
    </>
  );
}

export default App;
