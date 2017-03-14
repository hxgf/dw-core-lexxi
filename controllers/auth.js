


app.get('/login/?', function (req, res) {
  res.render('auth/auth-login', {
    title: 'Log In - ' + res.locals.site_title,
    ip: req.ip,
    redirect: req.query.redirect == 'home' ? '/' : req.headers.referer
  });
});








app.get('/register/?', function (req, res) {
  res.render('auth/auth-register', {
    title: 'Register - ' + res.locals.site_title,
    current_register: true
  });
});








app.get('/forgot/?', function (req, res) {
  res.render('auth/auth-forgot', {
    title: 'Forgot Password - ' + res.locals.site_title
  });
});








app.get('/forgot/reset/:hash?', function (req, res) {
  res.render('auth/auth-feedback', {
    title: 'New Password - ' + res.locals.site_title,
    hash: req.params.hash,
    forgot_reset: true
  });
});








app.get('/register/activate/:hash?', function (req, res) {
  var hash = req.params.hash ? req.params.hash : req.body.hash;
  models.user.findOne({ validate_hash: hash }).exec(function(err, data){
    if (err) return $.lexxi.application_error(err);
    if (data){
      models.user.update({ validate_hash: hash }, {
        validate_hash: null
      }).exec(function(err){
        if (err) return $.lexxi.application_error(err);
      });
      res.render('auth/auth-feedback', {
        title: 'Registration Complete - ' + res.locals.site_title,
        registration_complete: true
      });
      // api mode
      // res.json({
      //   success: true,
      //   email: data.email,
      //   password: data.password
      // });
    }else{
        res.redirect('/');
      // api mode
      // res.json({
      //   success: false,
      //   error: {
      //     message: "User Not Found"
      //   }
      // });
    }
  });
});








// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------








app.post('/register/process', function (req, res) {
  if (!req.body.website && req.body.email !== ''){
    var hash = $.lexxi.token_generate(25);
    var _email = req.body.email;
    var user = new models.user({
      email: _email.toLowerCase(),
      password: $.bcrypt.hashSync(req.body.password),
      group_id: 3,
      url_slug: $.v.slugify(req.body.screenname),
      screenname: req.body.screenname,
      validate_hash: hash,
    });
    user.save(function (err) {
      if (err) return $.lexxi.application_error(err);
      var message = 'Thanks for registering with ' + res.locals.site_title + '!\r\r' +
      'In order complete your account setup, we will need to verify your email address. Please click the link below and we can activate your account:\r\r' +
      'http://' + res.locals.site_url + '/register/activate/' + hash;
      $.lexxi.email_send($, {
        to: _email.toLowerCase(),
        from: '"' +res.locals.site_title+ '" <notifications@' + res.locals.site_url + '>',
        subject: 'Activate your new account',
        message: message,
      });
      res.render('auth/auth-feedback', {
        title: 'Register - ' + res.locals.site_title,
        hash: req.params.hash,
        register_process: true
      });
      // api mode
      // res.json({
      //   error: err ? err : false,
      //   success: err ? false : true
      // });
    });
  }else{
    res.redirect('/');
    // api mode
      // is this right?
    // res.json({
    //   error: err ? err : false,
    //   success: err ? false : true
    // });
  }
});








app.post('/forgot/process', function (req, res) {
  if (!req.body.website && req.body.email !== ''){
    var hash = $.lexxi.token_generate(25);
    var _email = req.body.email;
    models.user.update({ email: _email.toLowerCase() }, { password_hash: hash }).exec(function(err){
      if (err) return $.lexxi.application_error(err);
      var message = 'Here\'s the link to reset the password for your account at ' + res.locals.site_title + '.\r\r' +
      'http://' + res.locals.site_url + '/forgot/reset/' + hash;
      $.lexxi.email_send($, {
        to: _email.toLowerCase(),
        from: '"' +res.locals.site_title+ '" <notifications@' + res.locals.site_url + '>',
        subject: 'Reset your password',
        message: message
      });
      res.render('auth/auth-feedback', {
        title: 'Reset Password - ' + res.locals.site_title,
        hash: req.params.hash,
        forgot_process: true
      });
      // api mode
      // res.json({
      //   error: err ? err : false,
      //   success: err ? false : true
      // });
    });
  }else{
    res.redirect('/');
    // api mode
      // is this right?
    // res.json({
    //   error: err ? err : false,
    //   success: err ? false : true
    // });
  }
});








app.post('/forgot/reset/process', function (req, res) {
  if (!req.body.website){
    models.user.update({ password_hash: req.body.hash }, { password_hash: null, password: $.bcrypt.hashSync(req.body.password) }).exec(function(err){
      if (err) return $.lexxi.application_error(err);
      res.render('auth/auth-feedback', {
        title: 'Password Reset Successfully - ' + res.locals.site_title,
        hash: req.params.hash,
        forgot_reset_process: true
      });
      // api mode
      // res.json({
      //   error: err ? err : false,
      //   success: err ? false : true
      // });
    });
  }else{
    res.redirect('/');
    // api mode
      // is this right?
    // res.json({
    //   error: err ? err : false,
    //   success: err ? false : true
    // });
  }
});








app.post('/auth/login/process', function (req, res) {
  var _email = req.body.email;
  var password = req.body.password;
  models.user.findOne({ $or: [
      { email: _email.toLowerCase() },
      { screenname: _email.toLowerCase() }
    ], validate_hash: null }).exec(function(err, user_data){
    if (err) return $.lexxi.application_error(err);
    var password_valid = false;
    if (!req.body.website && user_data){
      if (user_data.group_id !== 4){
        if (req.body.password){
          if ($.bcrypt.compareSync(req.body.password, user_data.password)){
            password_valid = true;
          }
        }else{
          if (req.body.password_raw){
            if (user_data.password == req.body.password_raw){
              password_valid = true;
            }
          }
        }
      }
      if (password_valid){
        var out = {
          success: true,
          user_id: user_data._id,
          group_id: user_data.group_id,
          url_slug: user_data.url_slug,
          redirect: req.body.redirect,
          auth_token: $.bcrypt.hashSync(res.locals.site_code + '-' + user_data._id)
        };
        if (user_data.group_id === 1){
          out.admin_token = $.bcrypt.hashSync(res.locals.site_code);
        }
        if (user_data.group_id === 2){
          out.moderator_token = $.bcrypt.hashSync(res.locals.site_code+'-moderator');
        }
        models.user.update({ _id: user_data._id }, {
          ua_header: req.body.ua,
          ip_address: req.body.ip,
          date_last_login: new Date()
        }).exec(function(err){
          if (err) return $.lexxi.application_error(err);
          res.json(out);
        });
      }else{  // error: not a valid password
        res.json({
          error: {
            password: true,
            email: false,
            message: 'Error: Incorrect password'
          },
          success: false
        });
      }
    }else{  // error: not a valid email address
      res.json({
        error: {
          password: false,
          email: true,
          message: 'Error: Unregistered email address'
        },
        success: false
      });
    }
  });
});








// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------








app.get('/logout/?', function (req, res) {
  res.clearCookie('user_id');
  res.clearCookie('url_slug');
  res.clearCookie('auth_token');
  res.clearCookie('admin_token');
  res.clearCookie('moderator_token');
  res.redirect('/');
});








// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------








app.get('/account/settings', function (req, res) {
  models.user.findOne({ _id: res.locals.user_id }).exec(function(err, user_data){
    if (err) return $.lexxi.application_error(err);
    res.render('auth/auth-settings', {
      title: 'Account Settings - ' + res.locals.site_title,
      data: user_data,
      current_settings: true,
      error: err ? err : false,
      success: err ? false : true,
    });
    // api mode
    // res.json({
    //   title: 'Account Settings - ' + res.locals.site_title,
    //   data: user_data,
    //   current_settings: true,
    //   error: err ? err : false,
    //   success: err ? false : true,
    // });
  });
});








app.post('/account/settings/process', function (req, res) {
  var _email = req.body.email;
  var input = {
    email: _email.toLowerCase(),
    screenname: req.body.screenname,
    url_slug: $.v.slugify(req.body.screenname),
    first_name: req.body.first_name,
    last_name: req.body.last_name
  };
  if (req.body.password){
    input.password = $.bcrypt.hashSync(req.body.password);
  }
  models.user.update({ _id: res.locals.user_id }, input).exec(function(err){
    if (err) return $.lexxi.application_error(err);
    models.user.findOne({ _id: res.locals.user_id }).exec(function(err, user_data){
      res.render('auth/auth-settings', {
        title: 'Account Settings - ' + res.locals.site_title,
        data: user_data,
        current_settings: true,
        error: err ? err : false,
        saved: true,
        success: err ? false : true
      });
      // api mode
      // res.json({
      //   title: 'Account Settings - ' + res.locals.site_title,
      //   data: user_data,
      //   current_settings: true,
      //   error: err ? err : false,
      //   saved: true,
      //   success: err ? false : true,
      //   data: user_data
      // });
    });
  });
});








// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------








app.post('/auth/validate-unique', function (req, res) {
  var out = {
    error: false,
    success: true
  };
  // req.body.type === 'email' by default
  var user_query = { email: req.body.value };
  if (req.body.type === 'screenname'){
    user_query = { screenname: req.body.value };
  }
  models.user.findOne(user_query).exec(function(err, user_data){
    if (err) return $.lexxi.application_error(err);
    if (user_data){
      if (req.body.user_id === ''+user_data._id){
				// return true
        res.json(out);
      }else{
				// return error
        res.json({
          error: true,
          error_message: '* This '+req.body.type+' is already registered',
          success: false
        });
      }
    }else{
      // return true
      res.json(out);
    }
  });
});








// api-only
  // local server authentication is done on every route (to cookies & post vals...this is same, just w/ post)
  // this allows you to tell an external source (site, app) that the current user is this specific system user

app.post('/auth/authenticate-user', function (req, res) {
  var auth = false;
  var is_admin = false;
  var is_moderator = false;
  var user_id = false;
  if (req.body.auth_token){
    auth = $.bcrypt.compareSync($.settings.site_code+'-'+req.body.user_id, req.body.auth_token);
  }
  if (req.body.admin_token){
    is_admin = $.bcrypt.compareSync($.settings.site_code, req.body.admin_token);
  }
  if (req.body.moderator_token){
    is_moderator = $.bcrypt.compareSync($.settings.site_code+'-moderator', req.body.moderator_token);
  }
  res.json({
    user_id: user_id,
    auth: auth,
    is_admin: is_admin,
    is_moderator: is_moderator,
    year: new Date().getFullYear(),
    site_title: $.settings.site_title,
    site_code: $.settings.site_code,
    site_url: $.settings.site_url,
    title: $.settings.site_title,
    success: true
  });
});
