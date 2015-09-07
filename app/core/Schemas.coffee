App.Schemas = {}
{Schema} = Requires

App.Schemas.User = new Schema {
  date_registered:
    type: Date
    default: null
  ip:
    type: String
    default: null
  registration_key:
    type: String
    default: null
}

App.Schemas.Like = new Schema {
  date:
    type: Date
    default: new Date()
  username:
    type: String
    required: true
}

App.Schemas.Tag = new Schema {
  name:
    type: String
    required: true
    default: ''
  slug:
    type: String
    required: true
    default: ''
}

App.Schemas.Comment = new Schema {
  date:
    type: Date
    default: new Date()
  edited:
    type: Boolean
    default: false
  last_edited_date:
    type: Date
    default:null
  deleted:
    type: Boolean
    default: false
  deleted_date:
    type: Date
    default:null
  user:
    type: Schema.Types.Mixed
    default:{}
  content:
    type:String
    default:''
}

App.Schemas.Upload = new Schema {
  date_uploaded:
    type: Date
    default: new Date()
  title:
    type: String
    default: ''
  slug:
    type: String
    default:''
  desc:
    type: String
    default:''
  file_ext:
    type: String
    default:''
  likes: [App.Schemas.Like]
  num_likes:
    type: Number
    default:0
  permalink:
    type:String
    default:''
    unique:true
  tags: [App.Schemas.Tag]
  source_url:
    type:String
    default: ''
  comments: [App.Schemas.Comment]
  num_comments: 0
  is_private: false
  upload_error:
    type:Schema.Types.Mixed
    default: null
  has_error:
    type:Boolean
    default: false
  uploaded_by:
    type: String
    default: ''
}

App.Schemas.Admin = new Schema {
  username:
    type:String
    required: true
    unique: true
  password:
    type:String
    required: true
  logged_in:
    type:Boolean
    default: false
  session_id:
    type:String
    default: ''
  session_expires:
    type:Date
    default: null
}

App.Schemas.DataCache = new Schema {
  created: type: Date, required: true
  expires: type: Date, required: true
  slug: type: String, required: true
  parameters: type: String, default: ""
  data: type: Schema.Types.Mixed, default: []
}
