var currentModel = '../models/scrapbook2_glupi';

var canvas = document.querySelector("#workspace"),
    master = canvas.getContext("2d"),

    workspace = document.querySelector("#preview"),
    context = workspace.getContext("2d")

var image = new Image;
image.src = "cat-cute.jpg"
image.onload = loadedImage

var svg = d3.select("svg");
var brushGen = d3.brush()
              .on('start brush', brushed)
              .on('end', brushEnd);
var brush = undefined;
var brushX = 100;
var brushY = 100;

let style = ml5.styleTransfer(currentModel, image, loadedModel),
    // preview = document.querySelector("#preview"),
    modelReady = false

let STYLES = ['bruises', 'hennessy_zoom',
              'minard_immigration', 'minard_cattle', 'tufte_flatland',
              'scrapbook1_glupi', 'scrapbook2_glupi', 'moma_glupi',
              'clear']


d3.select('#brushes')
  .selectAll('button')
  .data(STYLES)
  .enter()
    .append('button')
    .text((s) => s.replace('_', ' '))
    .attr('onclick', (s) => `setStyle('${s}')`)

function uploadImage() {
  var filename = document.getElementById('selectImage').value;
  // console.log(filename);

  if (filename) {
    var fr = new FileReader();
    fr.onload = function() {
      image.src = fr.result;
    }
    fr.readAsDataURL(document.getElementById('selectImage').files[0]);
  }
  image.onload = loadedImage;
}
function loadedImage() {
  // FIXME: reshape canvas to upload
  let w = image.width, h = image.height
  canvas.width = w; workspace.width = w; svg.attr('width', w)
  canvas.height = h; workspace.height = h; svg.attr('height', h)

  master.drawImage(image, 0, 0, this.width, this.height)
                          // 0, 0, canvas.width, canvas.height);
  // console.log('drawing image');

  if (brush)
    brush.call(brushGen.move, null)
  brush = svg.append("g")
      .attr("class", "brush")
      .call(brushGen)
      .call(brushGen.move, [[brushX, brushY], [brushX, brushY]]);
}
function clearImage() {
  // WIP
  clearBrush();
  context.clearRect(0, 0, canvas.width, canvas.height)
}
function clearBrush() {
  brush.call(brushGen.move, null);
}
function applyBrush() {
  let data = workspace.toDataURL();
  let transfer = new Image()
  transfer.src = data
  transfer.onload = pasteImage
}
function pasteImage() {
  master.drawImage(this, 0, 0)
}

function setStyle(str) {
  if (str == 'clear') {
    style = undefined
    return
  }
  currentModel = '../models/'+str
  style = ml5.styleTransfer(currentModel, image, loadedModel),
  modelReady = false
}


function loadedModel() {
  // style.video = image // way too big
  modelReady = true
}

function brushed() {
  // console.log(d3.event.selection)
}
async function brushEnd() {
  if (!modelReady) return

  let s = d3.event.selection
  if (!s) return // no selection

  let [[x0,y0],[x1,y1]] = s
  if (x0 == x1 || y0 == y1) return // selection of size zero

  brushX = x0, brushY = y0
  let data = master.getImageData(x0, y0, x1-x0, y1-y0)
    // FIXME: Rectangular images are returned with correct data,
    //        but transposed width and height. Cludged for now.

  // image.data is an array of integer triples

  // HACK: tf.fromPixels() accepts ImageData, but ml5 itself
  //       fails to pass the argument unless we make it a default.
  // style.video = image

  if (style)
    style.transfer(data, showTransfer)
  else
    context.putImageData(data, brushX, brushY)
}

function showTransfer(err, img) {
  // https://stackoverflow.com/questions/4773966/drawing-an-image-from-a-data-url-to-a-canvas
  // console.log(img.width, img.height)

  context.drawImage(img, brushX, brushY)
  // TODO: correctly dispose of preview

  // TODO: commit preview to master
}
