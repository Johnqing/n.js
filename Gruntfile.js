module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    concat: {
      base: {
        options:{
          banner: '/* <%= pkg.name || pk.title %> - v<%= pkg.version %> - <%= pkg.homepage  %> - <%= grunt.template.today("yyyy-mm-dd") %> <%= pkg.author.name %>*/\n' 
        },
        src: [
          "src/n.js",
          "src/n.browser.js",
          "src/n.ajax.js"
        ],
        dest: 'dist/n.debug.js'
      },
      extras: {
        src: [
          "extras/n.cookie.js",
          "extras/n.template.js",
          "extras/n.animate.js"
        ],
        dest: 'dist/n.extras-debug.js'
      }
    },
    uglify: {
        my_target: {
            files: {
              'dist/n.min.js': ['dist/n.debug.js']
            }
        },
        my_advanced_target: {
            files: {
              'dist/n.extras.js': ['dist/n.extras-debug.js']
            }
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