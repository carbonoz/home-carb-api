import axios from 'axios'

const url = `https://api.carbonoz.com:9000/api/v1/auth/hosts`

const GetHosts = async () => {
  try {
    const response = await axios.get(url, {
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    })

    if (response.data) {
      return response.data
    }

    return null
  } catch (error) {
    console.error('Error authenticating user:', error.message)
    return null
  }
}

export default GetHosts
