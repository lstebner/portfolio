module.exports = function(models){
    var cache = {
        refresh: null
        ,store: {
            uris: []
        }
    };

    cache.refresh = function(){
        var self = this;

        models.Post.find({}, 'uri', function(err, posts){
            if (err){
                console.log('cache.refresh error: ' + err);
            }
            else{
                _.each(posts, function(p){
                    this.store.uris.push(p.uri);
                }, self);
            }
        });
    };

    return cache;
};
