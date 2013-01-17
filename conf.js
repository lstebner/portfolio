module.exports = function(){
    var conf = {};

    conf.view_data_defaults = {
        title: 'Luke Stebner'
    };

    //secrets - putting them here for error prevention if secrets doesn't load
    conf.contact_emaill = '';
    conf.AWSAccessKeyID = "";
    conf.AWSSecretKey = "";

    return conf;
};
