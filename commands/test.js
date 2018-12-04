const { Command, util } = require('klasa')
const fetch = require('chainfetch')

module.exports = class extends Command {
  constructor (...args) {
    super(...args, {
      requiredPermissions: [],
      requiredSettings: [],
      aliases: ['t'],
      autoAliases: true,
      permissionLevel: 10,
      usage: '',
      usageDelim: undefined,
      quotedStringSupport: false
    })
  }

  async run (message, [...params]) {
    let ayah = 1
    for (let surah = 41; surah <= 114; surah++) {
      let goToNextSurah = false
      while (!goToNextSurah) {
        const data = await fetch.get(`https://quran.com/${surah}/${ayah}`).catch(() => null)
        if (!data) {
          ayah = 1
          goToNextSurah = true
          continue
        }

        const strData = data.body.toString()
        const startIndex = strData.indexOf('<small class="english" data-reactid="')
        const endIndex = strData.indexOf('</small></h2></div><div data-reactid="')

        const verse = (strData.substring(startIndex, endIndex)).substring(43)
        const docName = `surah_${surah}`
        const ayahName = `ayah_${ayah}`
        const surahExists = await this.client.providers.default.get('quran', docName)
        if (surahExists) await this.client.providers.default.update('quran', docName, { [ayahName]: verse })
        else await this.client.providers.default.create('quran', docName, { [ayahName]: verse })
        console.log(`Surah #${surah} Verse #${ayah} has been added to the database.`)
        ayah++
        await util.sleep(30000)
      }
    }
  }

  async init () {
    if (this.client.providers.default.hasTable('quran')) return null
    this.client.providers.default.createTable('quran')
  }
}
