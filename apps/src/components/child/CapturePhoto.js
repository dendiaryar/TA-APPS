import React from "react";

//https://stackoverflow.com/questions/64341977/using-device-camera-for-capturing-image-in-reactjs
class MyImageCaptureComponent extends React.Component {
  constructor(props) {
    super(props);
    this.cameraNumber = 0;
  }

  initializeMedia = async () => {
    this.props.changeState("imageDataURL", null);

    if (!("mediaDevices" in navigator)) {
      navigator.mediaDevices = {};
    }

    if (!("getUserMedia" in navigator.mediaDevices)) {
      navigator.mediaDevices.getUserMedia = function (constraints) {
        var getUserMedia =
          navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        if (!getUserMedia) {
          return Promise.reject(new Error("getUserMedia Not Implemented"));
        }

        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }

    //Get the details of video inputs of the device
    const videoInputs = await this.getListOfVideoInputs();

    //The device has a camera
    if (videoInputs.length) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            deviceId: {
              exact: videoInputs[this.cameraNumber].deviceId,
            },
          },
        })
        .then((stream) => {
          this.player.srcObject = stream;
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      alert("The device does not have a camera");
    }
  };

  capturePicture = () => {
    var canvas = document.createElement("canvas");
    canvas.width = this.player.videoWidth;
    canvas.height = this.player.videoHeight;
    var contex = canvas.getContext("2d");
    contex.drawImage(this.player, 0, 0, canvas.width, canvas.height);
    this.player.srcObject.getVideoTracks().forEach((track) => {
      track.stop();
    });

    console.log(typeof canvas.toDataURL());
    this.props.changeState("imageDataURL", canvas.toDataURL());
  };

  getListOfVideoInputs = async () => {
    // Get the details of audio and video output of the device
    const enumerateDevices = await navigator.mediaDevices.enumerateDevices();

    //Filter video outputs (for devices with multiple cameras)
    return enumerateDevices.filter((device) => device.kind === "videoinput");
  };
  render() {
    const Continue = (e) => {
      e.preventDefault();
      this.props.nextStep();
    };
    const Previous = (e) => {
      e.preventDefault();
      this.props.prevStep();
    };
    const playerORImage = Boolean(this.props.values.imageDataURL) ? (
      <img src={this.props.values.imageDataURL} alt="cameraPic" />
    ) : (
      <video
        ref={(refrence) => {
          this.player = refrence;
        }}
        autoPlay
      ></video>
    );
    return (
      <div>
        {playerORImage}
        <button onClick={this.initializeMedia}>Take Photo</button>
        <button onClick={this.capturePicture}>Capture</button>
        <button type="submit" onClick={ Previous }>Previous</button>
        <button type="submit" onClick={ Continue }>Next</button>
      </div>
    );
  }
}

export default MyImageCaptureComponent;