//@codekit-prepend "../components/jquery/jquery.js";
//@codekit-prepend "css3-mediaqueries.js";

$(function(){
    $(window).resize(function(){
        if ($(window).width() < 2000){
            var diff = 2000 - $(window).width();
            $('#header').css('backgroundPosition', Math.round(diff/2) * -1);
        }
    }).resize();
});
