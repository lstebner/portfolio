module.exports = function(mongoose, schemas){
    var models = {};

    models.Tag = mongoose.model('Tag', schemas.Tag);
    models.Category = mongoose.model('Category', schemas.Category);
    models.Page = mongoose.model('Page', schemas.Page);

    return models;
};
