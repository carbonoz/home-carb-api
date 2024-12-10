import dayjs from 'dayjs'
import { promisify } from 'util'
import { redisClient } from '../config/redis.db'

import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

const hsetAsync = promisify(redisClient.hSet).bind(redisClient)
const hgetAsync = promisify(redisClient.hGet).bind(redisClient)

const timezones = [
  'Africa/Abidjan',
  'Africa/Accra',
  'Africa/Addis_Ababa',
  'Africa/Algiers',
  'Africa/Asmara',
  'Africa/Bamako',
  'Africa/Bangui',
  'Africa/Banjul',
  'Africa/Bissau',
  'Africa/Blantyre',
  'Africa/Brazzaville',
  'Africa/Bujumbura',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Ceuta',
  'Africa/Conakry',
  'Africa/Dakar',
  'Africa/Dar_es_Salaam',
  'Africa/Djibouti',
  'Africa/Douala',
  'Africa/El_Aaiun',
  'Africa/Freetown',
  'Africa/Gaborone',
  'Africa/Harare',
  'Africa/Johannesburg',
  'Africa/Juba',
  'Africa/Kampala',
  'Africa/Khartoum',
  'Africa/Kigali',
  'Africa/Kinshasa',
  'Africa/Lagos',
  'Africa/Libreville',
  'Africa/Lome',
  'Africa/Luanda',
  'Africa/Lubumbashi',
  'Africa/Lusaka',
  'Africa/Malabo',
  'Africa/Maputo',
  'Africa/Maseru',
  'Africa/Mbabane',
  'Africa/Mogadishu',
  'Africa/Monrovia',
  'Africa/Nairobi',
  'Africa/Ndjamena',
  'Africa/Niamey',
  'Africa/Nouakchott',
  'Africa/Ouagadougou',
  'Africa/Porto-Novo',
  'Africa/Sao_Tome',
  'Africa/Tripoli',
  'Africa/Tunis',
  'Africa/Windhoek',
  'America/Adak',
  'America/Anchorage',
  'America/Anguilla',
  'America/Antigua',
  'America/Araguaina',
  'America/Argentina/Buenos_Aires',
  'America/Argentina/Catamarca',
  'America/Argentina/Cordoba',
  'America/Argentina/Jujuy',
  'America/Argentina/La_Rioja',
  'America/Argentina/Mendoza',
  'America/Argentina/Rio_Gallegos',
  'America/Argentina/Salta',
  'America/Argentina/San_Juan',
  'America/Argentina/San_Luis',
  'America/Argentina/Tucuman',
  'America/Argentina/Ushuaia',
  'America/Aruba',
  'America/Asuncion',
  'America/Atikokan',
  'America/Bahia',
  'America/Bahia_Banderas',
  'America/Barbados',
  'America/Belem',
  'America/Belize',
  'America/Blanc-Sablon',
  'America/Boa_Vista',
  'America/Bogota',
  'America/Boise',
  'America/Cambridge_Bay',
  'America/Campo_Grande',
  'America/Cancun',
  'America/Caracas',
  'America/Cayenne',
  'America/Cayman',
  'America/Chicago',
  'America/Chihuahua',
  'America/Costa_Rica',
  'America/Creston',
  'America/Cuiaba',
  'America/Curacao',
  'America/Danmarkshavn',
  'America/Dawson',
  'America/Dawson_Creek',
  'America/Denver',
  'America/Detroit',
  'America/Dominica',
  'America/Edmonton',
  'America/Eirunepe',
  'America/El_Salvador',
  'America/Fort_Nelson',
  'America/Fortaleza',
  'America/Glace_Bay',
  'America/Goose_Bay',
  'America/Grand_Turk',
  'America/Grenada',
  'America/Guadeloupe',
  'America/Guatemala',
  'America/Guayaquil',
  'America/Guyana',
  'America/Halifax',
  'America/Havana',
  'America/Hermosillo',
  'America/Indiana/Indianapolis',
  'America/Indiana/Knox',
  'America/Indiana/Marengo',
  'America/Indiana/Petersburg',
  'America/Indiana/Tell_City',
  'America/Indiana/Vevay',
  'America/Indiana/Vincennes',
  'America/Indiana/Winamac',
  'America/Inuvik',
  'America/Iqaluit',
  'America/Jamaica',
  'America/Juneau',
  'America/Kentucky/Louisville',
  'America/Kentucky/Monticello',
  'America/Kralendijk',
  'America/La_Paz',
  'America/Lima',
  'America/Los_Angeles',
  'America/Lower_Princes',
  'America/Maceio',
  'America/Managua',
  'America/Manaus',
  'America/Marigot',
  'America/Martinique',
  'America/Matamoros',
  'America/Mazatlan',
  'America/Menominee',
  'America/Merida',
  'America/Metlakatla',
  'America/Mexico_City',
  'America/Miquelon',
  'America/Moncton',
  'America/Monterrey',
  'America/Montevideo',
  'America/Montserrat',
  'America/Nassau',
  'America/New_York',
  'America/Nipigon',
  'America/Nome',
  'America/Noronha',
  'America/North_Dakota/Beulah',
  'America/North_Dakota/Center',
  'America/North_Dakota/New_Salem',
  'America/Nuuk',
  'America/Ojinaga',
  'America/Panama',
  'America/Pangnirtung',
  'America/Paramaribo',
  'America/Phoenix',
  'America/Port-au-Prince',
  'America/Port_of_Spain',
  'America/Porto_Velho',
  'America/Puerto_Rico',
  'America/Punta_Arenas',
  'America/Rainy_River',
  'America/Rankin_Inlet',
  'America/Recife',
  'America/Regina',
  'America/Resolute',
  'America/Rio_Branco',
  'America/Santarem',
  'America/Santiago',
  'America/Santo_Domingo',
  'America/Sao_Paulo',
  'America/Scoresbysund',
  'America/Sitka',
  'America/St_Barthelemy',
  'America/St_Johns',
  'America/St_Kitts',
  'America/St_Lucia',
  'America/St_Thomas',
  'America/St_Vincent',
  'America/Swift_Current',
  'America/Tegucigalpa',
  'America/Thule',
  'America/Thunder_Bay',
  'America/Tijuana',
  'America/Toronto',
  'America/Tortola',
  'America/Vancouver',
  'America/Whitehorse',
  'America/Winnipeg',
  'America/Yakutat',
  'America/Yellowknife',
  'Antarctica/Casey',
  'Antarctica/Davis',
  'Antarctica/DumontDUrville',
  'Antarctica/Macquarie',
  'Antarctica/Mawson',
  'Antarctica/McMurdo',
  'Antarctica/Palmer',
  'Antarctica/Rothera',
  'Antarctica/Syowa',
  'Antarctica/Troll',
  'Antarctica/Vostok',
  'Europe/Berlin',
  'Indian/Mauritius',
]

export const saveToRedis = async ({
  topic,
  message,
  userId,
  mqttTopicPrefix,
}) => {
  try {
    const now = dayjs()

    // Check if it's midnight in any of the specified time zones
    const midnightTimezones = timezones.filter((timezone) => {
      const tzTime = now.tz(timezone)
      return tzTime.format('HH:mm') === '00:00'
    })

    for (const timezone of midnightTimezones) {
      const date = now.tz(timezone).format('YYYY-MM-DD')
       await hsetAsync('redis-data', date, `0,${userId},0,0,0,0,0`)
    }

    let existingData = await hgetAsync('redis-data', date)

    let load = 0
    let pv = 0
    let gridIn = 0
    let gridOut = 0
    let batteryCharged = 0
    let batteryDischarged = 0

    if (existingData) {
      const [
        existingPv,
        existingUserId,
        existingLoad,
        existingGridIn,
        existingGridOut,
        existingBatteryCharged,
        existingBatteryDischarged,
      ] = existingData.split(',').map(parseFloat)

      load = existingLoad
      pv = existingPv
      gridIn = existingGridIn
      gridOut = existingGridOut
      batteryCharged = existingBatteryCharged
      batteryDischarged = existingBatteryDischarged
    }

    let updated = false
    switch (topic) {
      case `${mqttTopicPrefix}/total/load_energy/state`:
        const newLoad = parseFloat(message)
        if (newLoad !== load) {
          load = newLoad
          updated = true
        }
        break
      case `${mqttTopicPrefix}/total/pv_energy/state`:
        const newPv = parseFloat(message)
        if (newPv !== pv) {
          pv = newPv
          updated = true
        }
        break
      case `${mqttTopicPrefix}/total/battery_energy_in/state`:
        const newBatteryCharged = parseFloat(message)
        if (newBatteryCharged !== batteryCharged) {
          batteryCharged = newBatteryCharged
          updated = true
        }
        break
      case `${mqttTopicPrefix}/total/battery_energy_out/state`:
        const newBatteryDischarged = parseFloat(message)
        if (newBatteryDischarged !== batteryDischarged) {
          batteryDischarged = newBatteryDischarged
          updated = true
        }
        break
      case `${mqttTopicPrefix}/total/grid_energy_in/state`:
        const newGridIn = parseFloat(message)
        if (newGridIn !== gridIn) {
          gridIn = newGridIn
          updated = true
        }
        break
      case `${mqttTopicPrefix}/total/grid_energy_out/state`:
        const newGridOut = parseFloat(message)
        if (newGridOut !== gridOut) {
          gridOut = newGridOut
          updated = true
        }
        break
      default:
        return
    }

    if (updated || !existingData) {
      const concatenatedValues = `${pv},${userId},${load},${gridIn},${gridOut},${batteryCharged},${batteryDischarged}`
      await hsetAsync('redis-data', date, concatenatedValues)
    }
  } catch (error) {
    console.error('Error saving data to Redis:', error)
  }
}
