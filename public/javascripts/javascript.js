var payload = {
    "waterfront":0,
    "zipcode": null,
    "bedrooms":null,
    "bathrooms":null,
    "lat":null,
    "sqft_living15":null,
    "long":null,
    "sqft_living":null
}

function onSelect()
{
    let e = document.getElementById("zipcode");
    console.log(e.options[e.selectedIndex].value)
    payload.zipcode = e.options[e.selectedIndex].value;
    console.log(payload)

}

function onChange()
{
    payload.bedrooms = parseFloat(document.getElementById('bedrooms').value)
    payload.bathrooms = parseFloat(document.getElementById('bathrooms').value);
    payload.lat = parseFloat(document.getElementById('lat').value);
    payload.sqft_living15 = parseFloat(document.getElementById('sqft_living15').value);
    payload.long = parseFloat(document.getElementById('long').value);
    payload.sqft_living = parseFloat(document.getElementById('sqft_living').value);

    console.log(payload)

}

function onToggle(){
    if (payload.waterfront == 1){
        payload.waterfront = 0
    } else 
    payload.waterfront = 1
    
    console.log(payload)
}


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

 
function onEstimate(){
    /*  const values = Object.payload.map(field => field); */
     const payload_scoring = {"input_data":
             [{"fields":[Object.keys(payload)],
             "values":[Object.values(payload)]}]  
     }
 
     const res = sendPayloadToDeployment(payload_scoring)
    
     return res
 }













function start_drawing(e)
{
    g_mouse_is_down = true;
    g_prev_pixel_X = e.clientX - document.getElementById( 'drawing_box' ).getBoundingClientRect().left;
    g_prev_pixel_Y = e.clientY - document.getElementById( 'drawing_box' ).getBoundingClientRect().top;
}


function stop_drawing(e)
{
    g_mouse_is_down = false;
    saveImage();
}


function draw_line(e)
{
    if( ( g_mouse_is_down ) && ( g_prev_pixel_X > -1 ) && ( g_prev_pixel_Y > -1 ) )
    {
        pixel_X = e.clientX - document.getElementById( 'drawing_box' ).getBoundingClientRect().left;
        pixel_Y = e.clientY - document.getElementById( 'drawing_box' ).getBoundingClientRect().top;
        
        var ctx = document.getElementById( 'drawing_box' ).getContext( '2d' );
        ctx.strokeStyle = "purple";
        ctx.lineWidth = g_line_width;
        ctx.beginPath();
        ctx.moveTo( g_prev_pixel_X, g_prev_pixel_Y );
        ctx.lineTo( pixel_X, pixel_Y );
        ctx.stroke();
        
        g_prev_pixel_X = pixel_X;
        g_prev_pixel_Y = pixel_Y;
        
        if( pixel_X < g_min_X ){ g_min_X = pixel_X; }
        if( pixel_X > g_max_X ){ g_max_X = pixel_X; }
        if( pixel_Y < g_min_Y ){ g_min_Y = pixel_Y; }
        if( pixel_Y > g_max_Y ){ g_max_Y = pixel_Y; }
    }
}


function clearCanvas()
{
    var canvas = document.getElementById( 'drawing_box' );
    var ctx = canvas.getContext( '2d' );
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
}


function clearPayloadDiv()
{
    document.getElementById( 'payload_pre' ).innerHTML = "";
    document.getElementById( 'payload_spinner' ).style.display = "none";
}


function populatePayloadDiv( payload )
{
    document.getElementById( 'payload_spinner' ).style.display = 'none';
    document.getElementById( 'payload_pre' ).innerHTML = JSON.stringify( payload, null, 3 );
}


function clearResultsDiv()
{
    document.getElementById( 'results_pre' ).innerHTML = "";
    document.getElementById( 'results_spinner' ).style.display = "none";
}


function populateResultsDiv( result )
{
    result = JSON.parse(result)
    if (result && result.predictions && result.predictions.length) {
        console.log(result.predictions[0])
        result = `${result.predictions[0].values[0][0]}`
    } else {
        result = "Invalid results from deployed model."
    }
    document.getElementById("price-output").value = numberWithCommas(Math.round((result) * 100) / 100);
    console.log(result)
}


function resetGlobalVars()
{
    g_mouse_is_down = false;
    g_prev_pixel_X  = -1;
    g_prev_pixel_Y  = -1;
    g_min_X = 200;
    g_min_Y = 200;
    g_max_X = 0;
    g_max_Y = 0;
}


function resetUI()
{
    clearCanvas();
    clearPayloadDiv();
    clearResultsDiv();
    document.getElementById( 'submit_button' ).title = 'Submit current drawing for analysis';
}


function clear_everything()
{
    resetUI();

    resetGlobalVars();

    g_saved_digit = null;
}


function saveImage()
{
    var canvas = document.getElementById( 'drawing_box' );
    var ctx = canvas.getContext( '2d' );
    g_saved_digit = ctx.getImageData( 0, 0, canvas.width, canvas.height );
}


function revertImage()
{
    resetUI();
    
    var ctx = document.getElementById( 'drawing_box' ).getContext( '2d' );
    ctx.putImageData( g_saved_digit, 0, 0 );
}


function drawRedBox( x, y, width, height )
{
    var ctx = document.getElementById( 'drawing_box' ).getContext( '2d' );
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect( x, y, width, height );
    ctx.stroke();    
}

function get_bounding_box()
{
    min_X  = g_min_X - g_line_width/2;
    min_Y  = g_min_Y - g_line_width/2;
    width  = g_max_X - g_min_X + g_line_width;
    height = g_max_Y - g_min_Y + g_line_width;
    
    var ctx = document.getElementById( 'drawing_box' ).getContext( '2d' );
    var digit_img = ctx.getImageData( min_X, min_Y, width, height );

    // Use a red box to show what's going on
    drawRedBox( min_X, min_Y, width, height );
    
    return digit_img;
}


function center( digit_img )
{
    var canvas = document.getElementById( 'drawing_box' );
    var ctx = canvas.getContext( '2d' );
    
    // Center the digit on the canvas
    var digit_min_X = canvas.width/2  - digit_img.width/2;
    var digit_min_Y = canvas.height/2 - digit_img.height/2;
    clearCanvas();
    ctx.beginPath();
    ctx.putImageData( digit_img, digit_min_X, digit_min_Y );

    // Get a square bounding box
    var max_dimension = ( digit_img.height > digit_img.width ) ? digit_img.height : digit_img.width;
    var square_box_min_X = canvas.width/2  - max_dimension/2;
    var square_box_min_Y = canvas.height/2 - max_dimension/2;
    centered_img = ctx.getImageData( square_box_min_X, square_box_min_Y, max_dimension, max_dimension );

    // Use a red box to show what's going on
    drawRedBox( square_box_min_X - 2, square_box_min_Y - 2, max_dimension + 4, max_dimension + 4 );
    
    return [ centered_img, square_box_min_X, square_box_min_Y ];
}


function resize_28x28( img, X, Y )
{
    var canvas = document.getElementById( 'drawing_box' );
    var ctx    = canvas.getContext( '2d' );

    // Save a copy of the original image in a temporary canvas
    var tempCanvas1    = document.createElement("canvas");
    tempCanvas1.width  = canvas.width;
    tempCanvas1.height = canvas.height;
    var tctx1          = tempCanvas1.getContext("2d");
    tctx1.putImageData( img, 0, 0 );

    // Use a second temporary canvas to scale the image way down to 28x28
    var tempCanvas2    = document.createElement("canvas");
    tempCanvas2.width  = canvas.width;
    tempCanvas2.height = canvas.height;
    var tctx2          = tempCanvas2.getContext("2d");
    scale = 28/img.width;
    tctx2.scale( scale, scale );
    tctx2.drawImage( tempCanvas1, 0, 0 );
    tiny_img = tctx2.getImageData( 0, 0, 28, 28 );

    // Show what's going on
    clearCanvas();
    ctx.beginPath();
    ctx.drawImage( tempCanvas2, 6, 6 );
    drawRedBox( 4, 4, 32, 32 );

    return tiny_img;
}

function resize_8x8( img, X, Y )
{
    var canvas = document.getElementById( 'drawing_box' );
    var ctx    = canvas.getContext( '2d' );

    // Save a copy of the original image in a temporary canvas
    var tempCanvas1    = document.createElement("canvas");
    tempCanvas1.width  = canvas.width;
    tempCanvas1.height = canvas.height;
    var tctx1          = tempCanvas1.getContext("2d");
    tctx1.putImageData( img, 0, 0 );

    // Use a second temporary canvas to scale the image way down to 28x28
    var tempCanvas2    = document.createElement("canvas");
    tempCanvas2.width  = canvas.width;
    tempCanvas2.height = canvas.height;
    var tctx2          = tempCanvas2.getContext("2d");
    scale = 8/img.width;
    tctx2.scale( scale, scale );
    tctx2.drawImage( tempCanvas1, 0, 0 );
    tiny_img = tctx2.getImageData( 0, 0, 8, 8 );

    // Show what's going on
    // clearCanvas();
    // ctx.beginPath();
    // ctx.drawImage( tempCanvas2, 6, 6 );
    // drawRedBox( 4, 4, 32, 32 );

    return tiny_img;
}


function greyscale( img )
{
    var canvas   = document.getElementById( 'drawing_box' );
    var ctx      = canvas.getContext( '2d' );
    var grey_img = ctx.createImageData( img.width, img.height );

    // Set Red, Green, and Blue values to 0, keep the Alpha value
    for( var i = 0; i < img.data.length; i += 4 )
    {
        grey_img.data[i]   = 0;
        grey_img.data[i+1] = 0;
        grey_img.data[i+2] = 0;
        grey_img.data[i+3] = img.data[i+3];
    }
    
    // Show what's going on
    clearCanvas();
    ctx.beginPath();
    ctx.putImageData( grey_img, 6, 6 );
    drawRedBox( 4, 4, 32, 32 );
    
    return grey_img;
}


function create_array_28x28( img )
{
    var arr = [];
    for( var i = 0; i < img.data.length; i += 4 )
    {
        arr.push( img.data[i+3] / 16 );
    }
    
    return arr;
}


function processresultHandler( result )
{
    if( "values" in result )
    {
        // This is what's returned by the sample model deployment
        // var model_result = document.getElementById( 'results_pre' ).innerHTML = result["values"][0];
        populateResultsDiv( model_result );
    }
    else if( "digit_class" in result )
    {
        // This is what's returned by the sample function deployment
        var func_result = document.getElementById( 'results_pre' ).innerHTML = result["digit_class"];
        populateResultsDiv( func_result );
    }
    else
    {
        var err_str = JSON.stringify( result, null, 3 );
        populateResultsDiv( err_str );
    }

}

