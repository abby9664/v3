const AirtablePlus = require('airtable-plus')

const mailScenariosTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'apptEEFG5HTfGQE7h',
  tableName: 'Mail Scenarios'
})
const peopleTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  basedID: 'apptEEFG5HTfGQE7h',
  tableName: 'People'
})
const addressesTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  basedID: 'apptEEFG5HTfGQE7h',
  tableName: 'Addresses'
})

export default async (req, res) => {
  if (req.method === 'POST') {
    const data = JSON.parse(body)
    let address

    // fetch person record
    const personRecord = await peopleTable.read({
      filterByFormula: `{Email} = '${data.email}'`,
      maxRecords: 1
    })
    if (typeof personRecord === 'undefined') {
      let personRecord = await peopleTable.create({
        'Full Name': data.name,
        'Email': data.email
      })
      let addressRecord = await addressesTable.create({
        'Street (First Line)': data.addressFirst,
        'Street (Second Line)': data.addressSecond,
        'City': data.city,
        'State/Province': data.state,
        'Country': data.country,
        'Person': [personRecord[0]]
      })
      address = await addressesTable.create({
        'Address (first line)': data.addressFirst,
        'Address (second line)': data.addressSecond,
        'Address (city)': data.city,
        'Address (state)': data.state,
        'Address (zip code)': data.zipCode,
        'Person': personRecord[0].id
      })
    }
    else {
      address = (await addressesTable.read({
        filterByFormula: `AND({Email} = '${data.email}', {Status} = '👍')`
      }))[0]
    }

    fetch(`${process.env.MAIL_MISSION_WEBHOOK}`, {
      method: 'POST',
      body: {
        'test': false,
        'scenarioRecordID': 'recNDwjb7Zr04Szix',
        'receiverAddressRecordID': address.id,
        'missionNotes': 'Requested via hackclub.com'
      }
    })
      .then(r => r.json())
      .then(r => res.json({ status: r.status }))
  }
}
