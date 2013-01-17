//@codekit-prepend "../components/jquery/jquery.js";
//@codekit-prepend "underscore.js";
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

    //contact form
    $('#contact-form').submit(function(){
        //check if it's already attempting to send
        if ($(this).find('input[type=submit]').attr('disabled')){
            return false;
        }

        //disable submit button
        $(this).find('input[type=submit]').text('Sending...').attr('disabled', true);

        //grab form data
        var data = {
                name: $(this).find('input[name=name]').val()
                ,email: $(this).find('input[name=email]').val()
                ,message: $(this).find('textarea[name=message]').val()
            }
            ,$alert = $(this).find('.alert')
            //for giving the user a response
            ,done = function(error, message){
                //show error message
                if (error){
                    $alert
                        .fadeIn()
                        .removeClass('alert-success')
                        .addClass('alert-error')
                        .children('p')
                            .text(message)
                    ;

                    $alert.closest('form').find('input[type=submit]').removeAttr('disabled');
                }
                //show success message
                else{
                    $alert
                        .fadeIn()
                        .removeClass('alert-error')
                        .addClass('alert-success')
                        .children('p')
                            .text(message)
                    ;
                }

                return false;
            }
        ;

        //validate name
        if (_.isEmpty(data.name)){
            return done(true, 'Name is required');
        }
        //validate email
        else if (_.isEmpty(data.email)){
            return done(true, 'Email is required');
        }
        //validate message
        else if (_.isEmpty(data.message)){
            return done(true, 'Message is required');
        }
        //that's good enough
        else{
            $.ajax({
                type:'post'
                ,url:'/contact-submit'
                ,data: data
                ,dataType: 'json'
                ,success: function(msg){
                    //something didn't work
                    if (msg.error){
                        return done(true, msg.message);
                    }
                    //yay
                    else{
                        return done(false, 'Message sent!');
                    }
                }
            })
        }

        return false;
    });

    //reset contact form
    function reset_contact_form(){
        $f = $('form[name=contact_form]');

        $f.find('.alert').fadeOut(300);
        $f.find('input[type=text],textarea').val('');
        $f.find('input[type=submit]').text('Send').removeAttr('disabled');
    }
});
