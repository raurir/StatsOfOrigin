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
        'origin.min.js': [
          'js/*.js'
        ]
  stylus:
    compile:
      files: [
        {
          expand: true
          cwd: "#{__dirname}/stylus/"
          src: ["*.styl"]
          dest: "#{__dirname}/"
          ext: ".css"
        }
      ]
      options:
        compress: true
        expand: false
)

grunt.registerTask('default', ['watch']);
grunt.registerTask('build', ['uglify', 'stylus']);
