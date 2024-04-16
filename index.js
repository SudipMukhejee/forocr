const tesseract = require("node-tesseract-ocr")

const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
}

tesseract
  .recognize("https://miro.medium.com/v2/resize:fit:722/1*_uOhbXSOZYAx4vV4GSWh0w.png", config)
  .then((text) => {
    console.log("Result:", text)
  })
  .catch((error) => {
    console.log(error.message)
  })
