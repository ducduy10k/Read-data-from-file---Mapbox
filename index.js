mapboxgl.accessToken =
  "pk.eyJ1IjoiYmV0YXBjaG9pMTBrIiwiYSI6ImNrY2ZuaWEwNjA2ZW0yeWw4bG9yNnUyYm0ifQ.bFCQ-5yq6cSsrhugfxO2_Q";
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: [105.37, 16.23], // starting position [lng, lat]
  zoom: 4.09, // starting zoom
  hash: "map",
  attributionControl: false,
});

function handleReadFile(event) {
  let file = document.getElementById("fileSelect").files[0];
  if (file) {
    let ext = getExtension(file.name);
    if (ext === "geojson") {
      readDataFromGeojsonFile(file);
    }
    if (ext === "kml") {
      readDataFromKMLFile(file);
    }
    if (ext === "shp") {
      readDataFromShpFile(file);
    }
    if (ext === "zip") {
      readDataFromShpZipFile(file);
    }

    switch (ext) {
      case "geojson":
        readDataFromGeojsonFile(file);
        break;
      case "kml":
        readDataFromKMLFile(file);
        break;
      case "shp":
        readDataFromShpFile(file);
        break;
      case "zip":
        readDataFromShpZipFile(file);
        break;
      default:
        alert("Invalid file ");
    }
  }
}

function getExtension(filename) {
  var parts = filename.split(".");
  return parts[parts.length - 1];
}

document
  .getElementById("fileSelect")
  .addEventListener("change", handleReadFile);

function readDataFromGeojsonFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const fc = JSON.parse(reader.result.toString());
    if (fc && fc.features.length > 0) {
      onHightLight(fc);
    }
  };
  reader.readAsText(file);
}

function readDataFromKMLFile(file) {
  let fileReader = new FileReader();
  fileReader.onload = async (e) => {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(e.target.result, "text/xml");
    onHightLight(toGeoJSON.kml(xmlDoc));
  };
  fileReader.readAsText(file);
}

function readDataFromShpFile(file) {
  var fc;
  const reader = new FileReader();
  reader.onload = (event) => {
    shapefile
      .openShp(reader.result)
      .then((source) =>
        source.read().then(function log(result) {
          if (result.done) {
            onHightLight(fc);
            return;
          }
          fc = result.value;
          return source.read().then(log);
        })
      )
      .catch((error) => console.error(error.stack));
  };
  reader.readAsArrayBuffer(file);
}

function readDataFromShpZipFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    shp(reader.result).then(function (fc) {
      if (fc.features.length > 0) {
        onHightLight(fc);
      }
    });
  };
  reader.readAsArrayBuffer(file);
}

function onHightLight(data) {
  clearLayerFeature();
  map.addSource("source-hightlight", {
    type: "geojson",
    data: data,
  });
  map.addLayer({
    id: "layer-hightlight",
    type: "line",
    source: "source-hightlight",
    layout: {},
    paint: {
      "line-color": "red",
      "line-width": 2,
    },
  });
}

function clearLayerFeature() {
  if (map.getLayer("layer-hightlight")) {
    map.removeLayer("layer-hightlight");
    map.removeSource("source-hightlight");
  }
}
