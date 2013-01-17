//@codekit-prepend "../components/jquery/jquery.js";
//@codekit-prepend "css3-mediaqueries.js";

$(function(){
    //a resize function which adjusts the header background image so that it stays properly centered
    $(window).resize(function(){
        if ($(window).width() < 2000){
            var diff = 2000 - $(window).width();
            $('#header').css('backgroundPosition', Math.round(diff/2) * -1);
        }
    }).resize();

    //check all links for domain and if it's not relative, then make it target:_blank
    $('a').each(function(){
        if ($(this).attr('href').search(new RegExp('http(|s):\/\/')) > -1){
            $(this).attr('target', '_blank');
        }
    });
});
