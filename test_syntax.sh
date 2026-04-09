osascript -l JavaScript -e "
try {
  ObjC.import('Foundation');
  var error = \$();
  var str = \$.NSString.stringWithContentsOfFileEncodingError('js/store.js', \$.NSUTF8StringEncoding, error);
  // Just testing if JS can execute
} catch (e) {
  console.log(e.message);
}
"
