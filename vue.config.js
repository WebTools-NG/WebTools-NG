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
}
