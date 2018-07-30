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
    javascript:
      files: ["#{__dirname}/js/*.js"]
      tasks: ['uglify']
  uglify:
    options:
      banner: '/*! StatsOfOrigin <%= grunt.template.today("dd-mm-yyyy") %> (https://github.com/raurir/StatsOfOrigin) */\n'
      # mangle: false, compress: false, beautify: true # dev
      mangle: false, compress: true, beautify: false # production
    dist:
      files:
        'deploy/js/origin.min.js': [
          'js/*.js'
        ]
  stylus:
    compile:
      files: [
        {
          expand: true
          cwd: "#{__dirname}/stylus/"
          src: ["*.styl"]
          dest: "#{__dirname}/deploy/css/"
          ext: ".css"
        }
      ]
      options:
        compress: true
        expand: false

  sync:
    main:
      files: [
        {
          cwd: "./"
          src: [
            'js/*.js'
            'lib/*.js'
            'fonts/*.json'
          ]
          dest: 'deploy/'
        }
      ]
      # pretend: true # Don't do any IO
      verbose: true

)

grunt.registerTask('default', ['watch'])
grunt.registerTask('build', ['uglify', 'stylus', 'sync'])
