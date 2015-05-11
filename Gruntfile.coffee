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
      ]
      tasks: ['uglify']

  uglify:
    options:
      banner: '/*! State of Origin Graph <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      # mangle: false, compress: false, beautify: true # dev
      mangle: false, compress: true, beautify: false # production
    dist:
      files:
        'origin.min.js': [
          'js/*.js'
        ]

  autoprefixer:
    multiple_files: {
      expand: true,
      flatten: true,
      src: 'css/*.css', # // -> src/css/file1.css, src/css/file2.css
      dest: 'css/autoprefixed/' # // -> dest/css/file1.css, dest/css/file2.css
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
