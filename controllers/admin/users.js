
// ----------------------------------------
//  user data schema
// ----------------------------------------

schemas.user = {
  email: String,
  password: String,
  validate_hash: String,
  password_hash: String,
  ua_header: String,
  ip_address: String,
  date_last_login: Date,
  date_created: { type: Date, default: Date.now },
  group_id: { type: Number, default: 3 },
    // 1 admin
    // 2 moderator
    // 3 end user
    // 4 blocked user
  url_slug: String, // profile url handle (url-safe version of screenname)
  screenname: String, // display name
  first_name: String,
  last_name: String,
  avatar_filename: String,
  avatar_small: { type: String, default: '/images/auth/avatar-default-s.png' },
  avatar_medium: { type: String, default: '/images/auth/avatar-default-m.png' },
  avatar_large: { type: String, default: '/images/auth/avatar-default-l.png' },
  avatar_original: { type: String, default: '/images/auth/avatar-default-o.png' }
};
var schema_user = new mongoose.Schema(schemas.user);
models.user = mongoose.model('users', schema_user);












app.get('/admin/users/?', function (req, res) {
  models.user.find().sort({ email: 1 }).lean().exec(function(err, data_users){
    if (err) return $.lexxi.application_error(err);
    res.render('admin/users-list', {
      layout: 'admin',
      title: 'Users - ' + res.locals.site_title,
      current_users: true,
      users: data_users,
      ip: req.ip
    });
    // api mode
    // res.json({
    //   error: err ? err : false,
    //   success: err ? false : true,
    //   users: user_data
    // });
  });
});












app.get('/admin/users/edit/:user_id', function (req, res) {
  var title = false;
  var query = false;
  if (req.params.user_id === 'new'){
    title = 'New User - '+ res.locals.site_title +' Admin';
    query = { _id: null };
  }else{
    query = { _id: req.params.user_id };
  }
  models.user.findOne(query).exec(function(err, user_data){
  if (err) return $.lexxi.application_error(err);
  // ??
  // !$._.isEmpty(user_data)
  if (user_data){
    title = 'Edit User - '+ user_data.screenname +' - '+ res.locals.site_title +' Admin';
  }
  res.render('admin/users-edit', {
    layout: 'admin',
    title: title,
    current_users: true,
    data: user_data,
    ip: req.ip
  });
  // api mode
  // res.json({
  //   error: err ? err : false,
  //   success: err ? false : true,
  //   users: user_data
  // });
  });
});












app.post('/admin/users/save', function (req, res) {
  var form = [];
  $.lexxi.parse_str(req.body.form, form);
  var _email = form.email;
  var input = {
    email: _email.toLowerCase(),
    group_id: form.group_id,
    url_slug: $.v.slugify(form.screenname),
    screenname: form.screenname,
    first_name: form.first_name,
    last_name: form.last_name
  };
  if (form.password){
    input.password = $.bcrypt.hashSync(form.password);
  }
  if (form._id === ''){
    var user = new models.user(input);
    user.save(function (err) {
      if (err) return $.lexxi.application_error(err);
    });
  }else{
    models.user.update({ _id: form._id }, input).exec(function(err){
      if (err) return $.lexxi.application_error(err);
    });
  }
  res.json({
    success: true
  });
});












app.post('/admin/users/delete', function (req, res) {
  models.user.find({ _id: req.body._id }).remove(function(){
    res.json({
      success: true
    });
  });
});
