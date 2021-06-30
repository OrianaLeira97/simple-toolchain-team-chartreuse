function start_drawing(e)
{
    g_mouse_is_down = true;
    g_prev_pixel_X = e.clientX - document.getElementById( 'drawing_box' ).getBoundingClientRect().left;
    g_prev_pixel_Y = e.clientY - document.getElementById( 'drawing_box' ).getBoundingClientRect().top;
}
