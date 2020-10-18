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
        appId: "com.webtools.webtools-ng",
        artifactName: "${productName}-${version}.${env.AppRev}.${ext}",        
        "extraResources": [
          {
            "from": "./public/locales",
            "to": "locales"
          },
          {
            "from": "./public/version.json",
            "to": "version.json"
          }
        ],
        linux: {
          category: "Utility",
          icon: 'src/assets/WebTools-512.png',
          target: 'AppImage'                  
        },
        win: {
          icon: 'src/assets/WebTools-512.png'
        },
        darwin: {
          icon: 'src/assets/WebTools-512.icns'
        }

      }
    }
  }
}
