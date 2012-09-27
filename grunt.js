module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-coffee');

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:js/<%= pkg.name %>.js>', 'src/jquery.imageloaded.min.js'],
        dest: 'js/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'js/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      files: ['src/<%= pkg.name %>.coffee', 'package.json'],
      tasks: 'coffee concat min'
    },
    coffee: {
      dist: {
        src: ['src/*.coffee'],
        dest: 'js/',
        options: {
          bare: true
        }
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'watch');

};