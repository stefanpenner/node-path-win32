// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
//
'use strict';
var path = require('../');
var assert = require('assert');

var f = __filename;

// On Windows a backslash acts as a path separator.
assert.equal(path.basename('\\dir\\basename.ext'), 'basename.ext');
assert.equal(path.basename('\\basename.ext'), 'basename.ext');
assert.equal(path.basename('basename.ext'), 'basename.ext');
assert.equal(path.basename('basename.ext\\'), 'basename.ext');
assert.equal(path.basename('basename.ext\\\\'), 'basename.ext');

assert.equal(path.dirname('c:\\'), 'c:\\');
assert.equal(path.dirname('c:\\foo'), 'c:\\');
assert.equal(path.dirname('c:\\foo\\'), 'c:\\');
assert.equal(path.dirname('c:\\foo\\bar'), 'c:\\foo');
assert.equal(path.dirname('c:\\foo\\bar\\'), 'c:\\foo');
assert.equal(path.dirname('c:\\foo\\bar\\baz'), 'c:\\foo\\bar');
assert.equal(path.dirname('\\'), '\\');
assert.equal(path.dirname('\\foo'), '\\');
assert.equal(path.dirname('\\foo\\'), '\\');
assert.equal(path.dirname('\\foo\\bar'), '\\foo');
assert.equal(path.dirname('\\foo\\bar\\'), '\\foo');
assert.equal(path.dirname('\\foo\\bar\\baz'), '\\foo\\bar');
assert.equal(path.dirname('c:'), 'c:');
assert.equal(path.dirname('c:foo'), 'c:');
assert.equal(path.dirname('c:foo\\'), 'c:');
assert.equal(path.dirname('c:foo\\bar'), 'c:foo');
assert.equal(path.dirname('c:foo\\bar\\'), 'c:foo');
assert.equal(path.dirname('c:foo\\bar\\baz'), 'c:foo\\bar');
assert.equal(path.dirname('\\\\unc\\share'), '\\\\unc\\share');
assert.equal(path.dirname('\\\\unc\\share\\foo'), '\\\\unc\\share\\');
assert.equal(path.dirname('\\\\unc\\share\\foo\\'), '\\\\unc\\share\\');
assert.equal(path.dirname('\\\\unc\\share\\foo\\bar'),
             '\\\\unc\\share\\foo');
assert.equal(path.dirname('\\\\unc\\share\\foo\\bar\\'),
             '\\\\unc\\share\\foo');
assert.equal(path.dirname('\\\\unc\\share\\foo\\bar\\baz'),
             '\\\\unc\\share\\foo\\bar');


// On windows, backspace is a path separator.
assert.equal(path.extname('.\\'), '');
assert.equal(path.extname('..\\'), '');
assert.equal(path.extname('file.ext\\'), '.ext');
assert.equal(path.extname('file.ext\\\\'), '.ext');
assert.equal(path.extname('file\\'), '');
assert.equal(path.extname('file\\\\'), '');
assert.equal(path.extname('file.\\'), '.');
assert.equal(path.extname('file.\\\\'), '.');

// path.join tests
var failures = [];
var joinTests = [];

joinTests = joinTests.concat(
  [// UNC path expected
    [['//foo/bar'], '//foo/bar/'],
    [['\\/foo/bar'], '//foo/bar/'],
    [['\\\\foo/bar'], '//foo/bar/'],
    // UNC path expected - server and share separate
    [['//foo', 'bar'], '//foo/bar/'],
    [['//foo/', 'bar'], '//foo/bar/'],
    [['//foo', '/bar'], '//foo/bar/'],
    // UNC path expected - questionable
    [['//foo', '', 'bar'], '//foo/bar/'],
    [['//foo/', '', 'bar'], '//foo/bar/'],
    [['//foo/', '', '/bar'], '//foo/bar/'],
    // UNC path expected - even more questionable
    [['', '//foo', 'bar'], '//foo/bar/'],
    [['', '//foo/', 'bar'], '//foo/bar/'],
    [['', '//foo/', '/bar'], '//foo/bar/'],
    // No UNC path expected (no double slash in first component)
    [['\\', 'foo/bar'], '/foo/bar'],
    [['\\', '/foo/bar'], '/foo/bar'],
    [['', '/', '/foo/bar'], '/foo/bar'],
    // No UNC path expected (no non-slashes in first component - questionable)
    [['//', 'foo/bar'], '/foo/bar'],
    [['//', '/foo/bar'], '/foo/bar'],
    [['\\\\', '/', '/foo/bar'], '/foo/bar'],
    [['//'], '/'],
    // No UNC path expected (share name missing - questionable).
    [['//foo'], '/foo'],
    [['//foo/'], '/foo/'],
    [['//foo', '/'], '/foo/'],
    [['//foo', '', '/'], '/foo/'],
    // No UNC path expected (too many leading slashes - questionable)
    [['///foo/bar'], '/foo/bar'],
    [['////foo', 'bar'], '/foo/bar'],
    [['\\\\\\/foo/bar'], '/foo/bar'],
    // Drive-relative vs drive-absolute paths. This merely describes the
    // status quo, rather than being obviously right
    [['c:'], 'c:.'],
    [['c:.'], 'c:.'],
    [['c:', ''], 'c:.'],
    [['', 'c:'], 'c:.'],
    [['c:.', '/'], 'c:./'],
    [['c:.', 'file'], 'c:file'],
    [['c:', '/'], 'c:/'],
    [['c:', 'file'], 'c:/file']
  ]);

// Run the join tests.
joinTests.forEach(function(test) {
  var actual = path.join.apply(path, test[0]);
  var expected = test[1].replace(/\//g, '\\');
  var message = 'path.join(' + test[0].map(JSON.stringify).join(',') + ')' +
                '\n  expect=' + JSON.stringify(expected) +
                '\n  actual=' + JSON.stringify(actual);
  if (actual !== expected) failures.push('\n' + message);
  // assert.equal(actual, expected, message);
});
assert.equal(failures.length, 0, failures.join(''));

// Test thrown TypeErrors
var typeErrorTests = [true, false, 7, null, {}, undefined, [], NaN];

function fail(fn) {
  var args = Array.prototype.slice.call(arguments, 1);

  assert.throws(function() {
    fn.apply(null, args);
  }, TypeError);
}

typeErrorTests.forEach(function(test) {
  fail(path.join, test);
  fail(path.resolve, test);
  fail(path.normalize, test);
  fail(path.isAbsolute, test);
  fail(path.relative, test, 'foo');
  fail(path.relative, 'foo', test);
  fail(path.parse, test);

  // These methods should throw a TypeError, but do not for backwards
  // compatibility. Uncommenting these lines in the future should be a goal.
  // fail(path.dirname, test);
  // fail(path.basename, test);
  // fail(path.extname, test);

  // undefined is a valid value as the second argument to basename
  if (test !== undefined) {
    fail(path.basename, 'foo', test);
  }
});


// path normalize tests
assert.equal(path.normalize('./fixtures///b/../b/c.js'),
             'fixtures\\b\\c.js');
assert.equal(path.normalize('/foo/../../../bar'), '\\bar');
assert.equal(path.normalize('a//b//../b'), 'a\\b');
assert.equal(path.normalize('a//b//./c'), 'a\\b\\c');
assert.equal(path.normalize('a//b//.'), 'a\\b');
assert.equal(path.normalize('//server/share/dir/file.ext'),
             '\\\\server\\share\\dir\\file.ext');

// path.resolve tests
// windows
var resolveTests =
  // arguments                                    result
  [[['c:/blah\\blah', 'd:/games', 'c:../a'], 'c:\\blah\\a'],
   [['c:/ignore', 'd:\\a/b\\c/d', '\\e.exe'], 'd:\\e.exe'],
   [['c:/ignore', 'c:/some/file'], 'c:\\some\\file'],
   [['d:/ignore', 'd:some/dir//'], 'd:\\ignore\\some\\dir'],
   [['.'], process.cwd().replace(/\//g,'\\')],
   [['//server/share', '..', 'relative\\'], '\\\\server\\share\\relative'],
   [['c:/', '//'], 'c:\\'],
   [['c:/', '//dir'], 'c:\\dir'],
   [['c:/', '//server/share'], '\\\\server\\share\\'],
   [['c:/', '//server//share'], '\\\\server\\share\\'],
   [['c:/', '///some//dir'], 'c:\\some\\dir']
  ];

var failures = [];
resolveTests.forEach(function(test) {
  var actual = path.resolve.apply(path, test[0]);
  var expected = test[1];
  var message = 'path.resolve(' + test[0].map(JSON.stringify).join(',') + ')' +
                '\n  expect=' + JSON.stringify(expected) +
                '\n  actual=' + JSON.stringify(actual);
  if (actual !== expected) failures.push('\n' + message);
  // assert.equal(actual, expected, message);
});
debugger
assert.equal(failures.length, 0, failures.join(''));

// path.isAbsolute tests
assert.equal(path.isAbsolute('//server/file'), true);
assert.equal(path.isAbsolute('\\\\server\\file'), true);
assert.equal(path.isAbsolute('C:/Users/'), true);
assert.equal(path.isAbsolute('C:\\Users\\'), true);
assert.equal(path.isAbsolute('C:cwd/another'), false);
assert.equal(path.isAbsolute('C:cwd\\another'), false);
assert.equal(path.isAbsolute('directory/directory'), false);
assert.equal(path.isAbsolute('directory\\directory'), false);

// windows
var relativeTests =
  // arguments                     result
  [['c:/blah\\blah', 'd:/games', 'd:\\games'],
   ['c:/aaaa/bbbb', 'c:/aaaa', '..'],
   ['c:/aaaa/bbbb', 'c:/cccc', '..\\..\\cccc'],
   ['c:/aaaa/bbbb', 'c:/aaaa/bbbb', ''],
   ['c:/aaaa/bbbb', 'c:/aaaa/cccc', '..\\cccc'],
   ['c:/aaaa/', 'c:/aaaa/cccc', 'cccc'],
   ['c:/', 'c:\\aaaa\\bbbb', 'aaaa\\bbbb'],
   ['c:/aaaa/bbbb', 'd:\\', 'd:\\']];

var failures = [];
relativeTests.forEach(function(test) {
  var actual = path.relative(test[0], test[1]);
  var expected = test[2];
  var message = 'path.relative(' +
                test.slice(0, 2).map(JSON.stringify).join(',') +
                ')' +
                '\n  expect=' + JSON.stringify(expected) +
                '\n  actual=' + JSON.stringify(actual);
  if (actual !== expected) failures.push('\n' + message);
});
assert.equal(failures.length, 0, failures.join(''));

// windows
assert.equal(path.sep, '\\');

// path.delimiter tests
// windows
assert.equal(path.delimiter, ';');
