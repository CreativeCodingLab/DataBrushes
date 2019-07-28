var currentModel = '../models/udnie';

var canvas = document.querySelector("#workspace"),
    master = canvas.getContext("2d"),

    workspace = document.querySelector("#preview"),
    context = workspace.getContext("2d"),

    background = document.querySelector("#background"),
    bgcontext = background.getContext("2d"),

    preload_b = document.querySelector("#preload_bruises"),
    preload_bruises = preload_b.getContext("2d"),

    preload_hz = document.querySelector("#preload_hennessy_zoom"),
    preload_hennessy_zoom = preload_hz.getContext("2d"),

    preload_mi = document.querySelector("#preload_minard_immigration"),
    preload_minard_immigration = preload_mi.getContext("2d"),

    preload_tf = document.querySelector("#preload_tufte_flatland"),
    preload_tufte_flatland = preload_tf.getContext("2d"),

    preload_s1g = document.querySelector("#preload_scrapbook1_glupi"),
    preload_scrapbook1_glupi = preload_s1g.getContext("2d"),

    preload_s2g = document.querySelector("#preload_scrapbook2_glupi"),
    preload_scrapbook2_glupi = preload_s2g.getContext("2d"),

    preload_mg = document.querySelector("#preload_moma_glupi"),
    preload_moma_glupi = preload_mg.getContext("2d"),

    preload_mc = document.querySelector("#preload_minard_cattle"),
    preload_minard_cattle = preload_mc.getContext("2d")


window.addEventListener('applybrush', () => {
  if (pendingSave) {
    let res = window.open() // chrome won't navigate directly to data URL, so we wrap it
    res.document.body.innerHTML = `<img src="${canvas.toDataURL("image/png")}" >`
    pendingSave = false
  }
})

let pendingSave = false
document.querySelector('#save').onclick = () => {
  pendingSave = true
  applyBrush() // will return before completing the onload chain, so we await an event.
}


var image = new Image;
image.src = "glupi-default.jpg"
image.onload = loadedImageFirst

var svg = d3.select("svg");
var brushGen = d3.brush()
              .on('start brush', brushed);
              //.on('end', brushEnd);
var brush = undefined;
var brushX = 100;
var brushY = 100;

let style = undefined, // ml5.styleTransfer(currentModel, image, loadedModel),
    // preview = document.querySelector("#preview"),
    modelReady = false

/*let STYLES = ['udnie', 'scream', 'wave',
              'wreck', 'matta', 'mathura',
              'la_muse', 'bruises', 'hennessy',
              'hennessy_zoom', 'minard_immigration',
              'tufte_flatland', 'scrapbook1_glupi',
              'scrapbook2_glupi', 'clear'] // 'matilde_perez', 'rain_princess'*/

let STYLES = ['bruises', 'hennessy_zoom', 'minard_immigration', 'tufte_flatland', 'scrapbook1_glupi', 'scrapbook2_glupi', 'moma_glupi', 'minard_cattle','clear']

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
  image.onload = loadedImageFirst;
}

function loadedImageFirst() {
  // TODO: tune inference
  let scalefactor = image.width*image.height > 800*800 ? 3 : 1

  let w = image.width/scalefactor, h = image.height/scalefactor
  canvas.width = w;
  workspace.width = w;
  background.width = w;
  preload_b.width = w;
  preload_hz.width = w;
  preload_mi.width = w;
  preload_tf.width = w;
  preload_s1g.width = w;
  preload_s2g.width = w;
  preload_mg.width = w;
  preload_mc.width = w;
  svg.attr('width', w);

  canvas.height = h;
  workspace.height = h;
  background.height = h;
  preload_b.height = h;
  preload_hz.height = h;
  preload_mi.height = h;
  preload_tf.height = h;
  preload_s1g.height = h;
  preload_s2g.height = h;
  preload_mg.height = h;
  preload_mc.height = h;
  svg.attr('height', h)

  master.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor);
  context.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor);
  preload_bruises.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor)
  preload_hennessy_zoom.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor)
  preload_minard_immigration.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor)
  preload_tufte_flatland.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor)
  preload_scrapbook1_glupi.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor)
  preload_scrapbook2_glupi.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor)
  preload_moma_glupi.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor)
  preload_minard_cattle.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor)

  context.globalCompositeOperation = "source-out";
  style0 = ml5.styleTransfer('../models/bruises', image, loadModelBruises)
  style1 = ml5.styleTransfer('../models/hennessy_zoom', image, loadModelHennessyZoom)
  style2 = ml5.styleTransfer('../models/minard_immigration', image, loadModelMinardImmigration)
  style3 = ml5.styleTransfer('../models/tufte_flatland', image, loadModelTufteFlatland)
  style4 = ml5.styleTransfer('../models/scrapbook1_glupi', image, loadModelScrapbook1)
  style5 = ml5.styleTransfer('../models/scrapbook2_glupi', image, loadModelScrapbook2)
  style6 = ml5.styleTransfer('../models/moma_glupi', image, loadModelMomaGlupi)
  style7 = ml5.styleTransfer('../models/minard_cattle', image, loadModelMinardCattle)

  // console.log('got style')
  modelReady = false;

  // console.log('done with computing all brushes');
  if (brush)
    brush.call(brushGen.move, null)
    brush = svg.append("g")
      .attr("class", "brush")
      .call(brushGen)
      .call(brushGen.move, [[brushX, brushY], [brushX, brushY]]);
}

function loadModelBruises() {
  // style.video = image // way too big
  modelReady = true
  var data = master.getImageData(0, 0, canvas.width, canvas.height)
  style0.transfer(data, showTransferBruises)
}

function showTransferBruises(err, img) {
  preload_bruises.drawImage(img, 0, 0)
  console.log("loaded bruises")
}

function loadModelHennessyZoom() {
  modelReady = true;
  var data = master.getImageData(0, 0, canvas.width, canvas.height)
  style1.transfer(data, showTransferHennessyZoom)
}

function showTransferHennessyZoom(err, img) {
  preload_hennessy_zoom.drawImage(img, 0, 0)
  console.log("loaded hennessy zoom")
}

function loadModelMinardImmigration() {
  modelReady = true;
  var data = master.getImageData(0, 0, canvas.width, canvas.height)
  style2.transfer(data, showTransferMinardImmigration)
}

function showTransferMinardImmigration(err, img) {
  preload_minard_immigration.drawImage(img, 0, 0)
  console.log("loaded minard immigration")
}

function loadModelTufteFlatland() {
  modelReady = true;
  var data = master.getImageData(0, 0, canvas.width, canvas.height)
  style3.transfer(data, showTransferTufteFlatland)
}

function showTransferTufteFlatland(err, img) {
  preload_tufte_flatland.drawImage(img, 0, 0)
  console.log("loaded tufte flatland")
}

function loadModelScrapbook1() {
  modelReady = true;
  var data = master.getImageData(0, 0, canvas.width, canvas.height)
  style4.transfer(data, showTransferScrapbook1)
}

function showTransferScrapbook1(err, img) {
  preload_scrapbook1_glupi.drawImage(img, 0, 0)
  console.log("loaded scrapbook1")
}

function loadModelScrapbook2() {
  modelReady = true;
  var data = master.getImageData(0, 0, canvas.width, canvas.height)
  style5.transfer(data, showTransferScrapbook2)
}

function showTransferScrapbook2(err, img) {
  preload_scrapbook2_glupi.drawImage(img, 0, 0)
  console.log("loaded scrapbook2")
}

function loadModelMomaGlupi() {
  modelReady = true;
  var data = master.getImageData(0, 0, canvas.width, canvas.height)
  style6.transfer(data, showTransferMomaGlupi)
}

function showTransferMomaGlupi(err, img) {
  preload_moma_glupi.drawImage(img, 0, 0)
  console.log("loaded moma GLupi")
}

function loadModelMinardCattle() {
  modelReady = true;
  var data = master.getImageData(0, 0, canvas.width, canvas.height)
  style7.transfer(data, showTransferMinardCattle)
}

function showTransferMinardCattle(err, img) {
  preload_minard_cattle.drawImage(img, 0, 0)
  console.log("loaded minard cattle")
}





function useBruises() {
  bgcontext.drawImage(preload_bruises.canvas, 0, 0);
}
function useHennessy() {
  bgcontext.drawImage(preload_hennessy_zoom.canvas, 0, 0);
}
function useImmigration() {
  bgcontext.drawImage(preload_minard_immigration.canvas, 0, 0);
}
function useFlatland() {
  bgcontext.drawImage(preload_tufte_flatland.canvas, 0, 0);
}
function useScrapbook1() {
  bgcontext.drawImage(preload_scrapbook1_glupi.canvas, 0, 0);
}
function useScrapbook2() {
  bgcontext.drawImage(preload_scrapbook2_glupi.canvas, 0, 0);
}
function useMoma() {
  bgcontext.drawImage(preload_moma_glupi.canvas, 0, 0);
}
function useCattle() {
  bgcontext.drawImage(preload_minard_cattle.canvas, 0, 0);
}


function clearBrush() {
  brush.call(brushGen.move, null);

  image = new Image();
  image.src = canvas.toDataURL();
  image.onload = loadedImage;
  //context.clearRect(0, 0, canvas.width, canvas.height);
  //context.drawImage(image, 0, 0, canvas.width, canvas.height);

  /* if (style) // was failing due to data === undefined, to no ill effect
    style.transfer(data, showTransferBG)
  */
}

function applyBrush() {
  let data = background.toDataURL();
  let transfer = new Image()
  transfer.src = data
  transfer.onload = pasteImage // await style
}

function pasteImage() {
  master.drawImage(this, 0, 0)

  let data2 = workspace.toDataURL();
  let transfer2 = new Image();
  transfer2.src = data2;
  transfer2.onload = pasteMask // await mask
}

function pasteMask() {
  master.drawImage(this, 0, 0)
  window.dispatchEvent(new CustomEvent('applybrush'))

  clearBrush()
}

function setStyle(str) {
  if (str == 'clear') {
    style = undefined
    return
  }
  context.globalCompositeOperation = "source-out";
  currentModel = '../models/'+str
  style = ml5.styleTransfer(currentModel, image, loadedModel)
  console.log('got style')
  modelReady = false;
}


function loadedModel() {
  // style.video = image // way too big
  modelReady = true

  var data = master.getImageData(0, 0, canvas.width, canvas.height)
  console.log(data)

  if (style) {
    brushX = 0
    brushY = 0
    style.transfer(data, showTransferBG)
  } else {
    bgcontext.putImageData(data, 0, 0)
  }

}

function showTransferBG(err, img) {
  // https://stackoverflow.com/questions/4773966/drawing-an-image-from-a-data-url-to-a-canvas
  // console.log(img.width, img.height)

  bgcontext.drawImage(img, brushX, brushY)
  // TODO: correctly dispose of preview

  // TODO: commit preview to master
}

function brushed() {
  //brushEnd();
  let s = d3.event.selection
  if (!s) return // no selection

  let [[x0,y0],[x1,y1]] = s
  style_ = true;
  //if (style)
  if (style_)
    context.clearRect(x0, y0, x1-x0, y1-y0);
  else {
    let data = master.getImageData(x0, y0, x1-x0, y1-y0)
    context.putImageData(data, x0, y0)
  }
}

async function brushEnd() {
  if (!modelReady) return

  let s = d3.event.selection
  if (!s) return // no selection

  let [[x0,y0],[x1,y1]] = s
  if (x0 == x1 || y0 == y1) return // selection of size zero

  brushX = x0, brushY = y0
  let data = master.getImageData(x0, y0, x1-x0, y1-y0)

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

function loadedImage() {
  // TODO: tune inference
  let scalefactor = image.width*image.height > 800*800 ? 3 : 1

  let w = image.width/scalefactor, h = image.height/scalefactor

  canvas.width = w;
  workspace.width = w;
  background.width = w;
  svg.attr('width', w);

  canvas.height = h;
  workspace.height = h;
  background.height = h;
  svg.attr('height', h)

  master.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor);
  context.drawImage(image, 0, 0, this.width/scalefactor, this.height/scalefactor);

  console.log('got style')
  modelReady = false;
                          // 0, 0, canvas.width, canvas.height);
  // console.log('drawing image');

  if (brush)
    brush.call(brushGen.move, null)
  brush = svg.append("g")
      .attr("class", "brush")
      .call(brushGen)
      .call(brushGen.move, [[brushX, brushY], [brushX, brushY]]);
}
