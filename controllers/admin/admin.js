

app.get('/admin/?', function (req, res) {
  var title = res.locals.site_title;
  if (!res.locals.is_admin){
    title = 'Log In - ' + title;
  }
  res.render('admin/index', {
    layout: 'admin',
    title: title,
  });
});




// --------------------------------------------------------------------
//  DARKWAVE utility (moving somewhere in the future) (maybe to its own lib?)
// --------------------------------------------------------------------


// ---------- create initial admin user


// app.get('/utility/create-admin-user', function (req, res) {
//
//   // type your credentials here before running this:
//   var email = '';
//   var screenname = '';
//   var first_name = '';
//   var last_name = '';
//   var password = '';
//
//   var _email = email;
//   var user = new models.user({
//     email: _email.toLowerCase(),
//     password: $.bcrypt.hashSync(password),
//     validate_hash: null,
//     first_name: first_name,
//     last_name: last_name,
//     screenname: screenname,
//     url_slug: $.v.slugify(screenname),
//     group_id: 1,
//   });
//   user.save(function (err) {
//     if (err) return $.lexxi.handle_error(err);
//     res.json({
//       error: err ? err : false,
//       success: err ? false : true
//     });
//   });
// });



// ---------- handle file uploads (needs to be updated)

// app.post('/utility/upload', function (req, res) {
//   if (req.files.file){
//     var path_original = req.files.file.path;
//
//     var filename_original = req.files.file.originalname;
// 	  var ext = path.extname(filename_original);
//     // holy shit lol
// 		var filename_new = $.v.slugify(filename_original.substr(0, filename_original.lastIndexOf('.')).toLowerCase());
//     var path_new = $.__base + 'app/uploads/temp-' + filename_new + ext;
//
//     fs.rename(path_original, path_new, function(err) {
//       if (err) throw err;
//         res.json({
//           success: true,
//           url:  'http://' + $.config.api_url + '/uploads/temp-' + filename_new + ext
//         });
//     });
//   }
// });



// ---------- crop a thumbnail (needs to be updated)

// app.post('/utility/thumbnail-crop', function (req, res) {
//   var o = {
//     success: true,
//     error: false
//   };
//   var source_url = req.body.source;
//   var filename = source_url.split("http://s3.amazonaws.com/"+$.config.s3.bucket+"/");
//   var ext = filename[1].split('-m.');
//   var mimetype = mime.lookup(ext[1]);
//   var filename_new = filename[1].replace('-m.','-s.');
//
//   gm(req.body.source)
//     .options({imageMagick: true})
//     .crop(req.body.w, req.body.h, req.body.x, req.body.y)
//     .resize(250)
//     .quality(90)
//     .write($.__base + 'app/uploads/tmp-'+res.locals.user_id+'.'+ext[1], function (err) {
//       s3.putFile(
//         $.__base + 'app/uploads/tmp-'+res.locals.user_id+'.'+ext[1],
//         '/'+filename_new,
//         { 'x-amz-acl': 'public-read', 'Content-Type': mimetype }, function(err, ress){
//         if (err) return $.lexxi.handle_error(err);
//         fs.unlink($.__base + 'app/uploads/tmp-'+res.locals.user_id+'.'+ext[1]);
//         res.json(o);
//       });
//
//   });
// });
