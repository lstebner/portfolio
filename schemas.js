module.exports = function(Schema){
    var schemas = {};

    schemas.Category = new Schema({
        name: { type:String, default: '' }
        ,slug: { type:String, default: '' }
    });

    schemas.Tag = new Schema({
        name: { type:String, default: '' }
        ,slug: { type:String, default: '' }
    });

    schemas.Page = new Schema({
        uri: { type:String, required: true }
        ,published: { type:Boolean, default: false }
        ,publish_date: { type:Date, default: null }
        ,title: { type:String, default: '' }
        ,slug: { type:String, default: '' }
        ,content_raw: { type:String, default: '' }
        ,content_html: { type:String, default: '' }
        ,meta: { type:Schema.Types.Mixed, default: {} }
        ,author: { type:String, default: '' }
        ,categories: [schemas.Category]
        ,tags: [schemas.Tag]
    });

    return schemas;
};
