module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    concat: {
      dist: {
        src: [
          "src/n.js",
          "src/n.browser.js",
          "src/n.ajax.js",
          "src/n.cookie.js"
        ],
        dest: 'dist/n.debug.js'
      }
    },
    uglify: {
        js: {
            src: 'dist/n.debug.js',
            dest: 'dist/n.min.js'
        }
    },
    watch: {
      scripts: {
        files: ['**/*.js'],
        tasks: ['default'],
        options: {
          spawn: false
        }
      }
    }
  });

  // Load grunt tasks from NPM packages
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default",["concat", "uglify", "watch"]);

};