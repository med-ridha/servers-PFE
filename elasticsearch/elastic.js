import { Client } from '@elastic/elasticsearch'

const client = new Client({ node: 'http://localhost:9200' })

async function run() {
  //const response = await client.info();
  //console.log(response)
  // await client.index({
  //   index: 'game-of-thrones',
  //   document: {
  //     charecter: 'Ned Stark',
  //     quote: 'winter is coming'
  //   }
  // })
  // await client.index({
  //   index: 'game-of-thrones',
  //   document: {
  //     charecter: 'Daenerys Targaryen',
  //     quote: 'I am the blood of the dragon'
  //   }
  // })
  // await client.index({
  //   index: 'game-of-thrones',
  //   document: {
  //     charecter: 'Tyrion Lannister',
  //     quote: 'A mind needs books like a sword needs a whetstone'
  //   }
  // })
  await client.delete({
    index: 'game-of-thrones',
    document: {
      charecter: 'Tyrion Lannister',
      quote: 'A mind needs books like a sword needs a whetstone'
    }
  })
  await client.indices.refresh({ index: "game-of-thrones" })
  const result = await client.search({
    index: 'game-of-thrones',
    query: {
      match: { charecter: 'Lannister' }
    }
  })

  console.log(result.hits.hits)
}

run().catch(err => console.log(err))




