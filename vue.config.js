process.env.VUE_APP_VERSION = process.env.npm_package_version;

module.exports = {
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    },
    electronBuilder: {
      builderOptions: {        
        "extraResources": [
          {
            "from": "./public/locales",
            "to": "locales"
          }
        ],
        "linux": {
          "category": "Utility"
        }        
      }
    }
  }
  // ,  
  // chainWebpack: config => {
  //   config
  //       .plugin('html')
  //       .tap(args => {
  //         let v = JSON.stringify(require('./package.json').version)
  //         args[0]['process.env']['VERSION'] = v                    
  //         return args;
  //       })
  // }
}
