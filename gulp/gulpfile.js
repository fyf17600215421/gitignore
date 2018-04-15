 let gulp = require("gulp");
 const imgMin = require("gulp-imagemin");
 const uglify = require("gulp-uglify");
 const concat = require("gulp-concat");
 const minCss = require("gulp-clean-css");
 const minHtml = require("gulp-minify-html");
 const reName = require("gulp-rename");
 const gulpWebserver = require("gulp-webserver");
 const sequence = require("gulp-sequence");
 const clean = require("gulp-clean");
 const querystring = require("querystring")
 const rev = require("gulp-rev");
 const revCollector = require("gulp-rev-collector");

 const url = require("url");
 gulp.task("mess", () => {
     return gulp.src(['rev/**/*.json', 'src/*.html'])
         .pipe(minHtml())
         .pipe(gulp.dest("dist"))
         .pipe(revCollector({
             replaceReved: true
         }))
         .pipe(gulp.dest("dist"))
 })

 gulp.task("imgmin", () => {
     return gulp.src("src/images/*")
         .pipe(imgMin())
         .pipe(gulp.dest("dist/images"));
 })

 gulp.task("cont", () => {
     return gulp.src("src/js/*")
         .pipe(concat("main.js"))
         .pipe(uglify())
         .pipe(gulp.dest("dist/js"))

 })

 gulp.task("mincss", () => {
     return gulp.src("src/css/**/*.css", { base: "src" })
         .pipe(minCss())
         .pipe(reName({ suffix: ".min" }))
         .pipe(rev())
         .pipe(gulp.dest("dist"))
         .pipe(rev.manifest())
         .pipe(gulp.dest('rev/css'))
 })

 gulp.task("clean", () => {
     return gulp.src("./dist")
         .pipe(clean())
 })

 gulp.task("watch", () => {
     gulp.watch("src/index.html", ["mess"])
     gulp.watch("src/css/*", ["mincss"])
     gulp.watch("src/js/*", ["cont"])
 })
 gulp.task("default", (cd) => {
     sequence("clean", ["mess", "cont", "mincss", "watch"], "server", cd)
 })




 gulp.task("server", function() {
     return gulp.src("dist")
         .pipe(gulpWebserver({
             host: "localhost",
             port: 8888,
             open: true,
             livereload: true,
             middleware: function(req, res, next) {
                 if (req.url == "/login") {
                     res.writeHead(200, {
                         "Content-Type": "text/plain"
                     })
                     let name = "fuwanfeng",
                         password = "123456";
                     let data = "";
                     req.on("data", (chunck) => {
                         data += chunck.toString()
                     })
                     req.on("end", () => {
                         let user = querystring.parse(data);
                         if (user.username == name && user.password == password) {
                             res.end(JSON.stringify({ code: 1 }));
                         } else {
                             res.end(JSON.stringify({ code: 0 }));
                         }

                     })
                 }
                 next();
             }
         }))
 });

 /**
  * 问题出现在：热部署是用服务器起的服务
  * 修改文件时是触发的是服务器 由服务器重启浏览器达到刷新的效果
  */