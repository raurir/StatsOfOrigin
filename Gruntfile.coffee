con = console

grunt = require('grunt')

grunt.loadNpmTasks('grunt-autoprefixer')
grunt.loadNpmTasks('grunt-contrib-stylus')
grunt.loadNpmTasks('grunt-contrib-uglify')
grunt.loadNpmTasks('grunt-contrib-watch')
grunt.loadNpmTasks('grunt-sync')

grunt.initConfig(
  watch:
    stylus:
      files: ["#{__dirname}/stylus/*.styl"]
      tasks: ['stylus:compile']
    styles:
      files: ["#{__dirname}/css/*.css"]
      tasks: ['autoprefixer']
    javascript:
      files: [
        "#{__dirname}/js/*.js"
        "#{__dirname}/deploy/experiments/*.js"
      ]
      tasks: ['jshint', 'uglify']
      # tasks: ['jshint']

  uglify:
    options:
      banner: '/*! Infinite Print <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      mangle: false
      compress: false
      beautify: true
    dist:
      files:
        'deploy/js/infinite.min.js': [

          'deploy/experiments/rand.js'
          'deploy/experiments/dom.js'
          'deploy/experiments/colours.js'
          'deploy/experiments/geom.js'
          'deploy/experiments/experiments_infinite.js'
          'deploy/experiments/experiments_progress.js'

          # 'deploy/experiments/hexagon_tile.js'
          # 'deploy/experiments/bezier_flow.js'
          # 'deploy/experiments/maze.js'

          'js/*.js'

        ]

  autoprefixer:
    multiple_files: {
      expand: true,
      flatten: true,
      src: 'css/*.css', # // -> src/css/file1.css, src/css/file2.css
      dest: 'deploy/css/' # // -> dest/css/file1.css, dest/css/file2.css
    }

  stylus:
    compile:
      files: [
        {
          expand: true
          cwd: "#{__dirname}/stylus/"
          src: ["*.styl"]
          dest: "css/"
          ext: ".css"
        }
      ]
      options:
        compress: false
        expand: true
)

grunt.registerTask('default', ['watch']);
