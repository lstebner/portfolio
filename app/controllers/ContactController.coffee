class App.ContactController extends Portfolio.Controller
  {nodemailer} = Requires

  name: "ContactController"

  setup: ->
    @public_methods = ["submit"]
    @setup_transport()
    super

  setup_transport: ->
    @transport = nodemailer.createTransport "SES",
      AWSAccessKeyID: App.conf "AWSAccessKeyID"
      AWSSecretKey: App.conf "AWSSecretKey"

  submit: ->
    return console.log "transport not set up!" unless @transport

    data = _.extend
      name: ""
      email: ""
      message: ""
      , @req.body

    message_data =
      from: App.conf("contact_email")
      to: App.conf("contact_email")
      subject: "Contact Form from #{data.name}"
      text:
        """
        From: #{data.name}\n
        Email: #{data.email}\n\n
        #{data.message}
        """

    done = (err, message) =>
      @json error: err, message: message

    @transport.sendMail message_data, (err, msg) =>
      if err
        console.log 'sendMail error: ' + err
        done true, 'Error sending message, please try again.'
      else
        done false, false

