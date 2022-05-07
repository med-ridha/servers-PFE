import { Client } from '@elastic/elasticsearch'

const client = new Client({ node: 'http://localhost:9200' })

let elastic = {
  deleteDocument: async function(docId) {
    const result = await client.delete({
      index: 'documents',
      id: docId,
    })
    await client.indices.refresh({ index: 'documents' })
    console.log(result);
  },

  addDocument: async function(document) {
    if (document._id === undefined) return;
    await client.indices.refresh({ index: 'documents' })
    const result = await client.index({
      index: 'documents',
      id: document._id,
      document: {
        "id": document._id,
        "titleFr": document.titleFr,
        "titleAr": document.titleAr
      }
    })
    console.log(result);
  },

  search: async function(query) {
    let listDocumentIds = [];
    await client.indices.refresh({ index: 'documents' })
    let count = await client.count({index: 'documents'})
    let result = await client.search({
      index: 'documents',
      size: count.count,
      query: {
        multi_match: {
          query: query,
          fields: ["titleFr", "titleAr"]
        }
      }
    })
    console.log(result)
    listDocumentIds = result.hits.hits.map(hit => hit._id);
    return listDocumentIds;
  }

}
export default elastic;
async function run() {
 // const response = await client.info();
 // console.log(response)

  // await client.delete({
  //   index: 'game-of-thrones',
  //   id: "6jMcnoABOp5UozJhQfql",
  // })
  await client.indices.refresh({ index: "documents" })
  let result = await client.count({ index: "documents" })

  // const result = await client.get({
  //   index: 'documents',
  //   id: '6261121f95da03bf17a8d9cc'
  // })

  console.log(result)
}

//run().catch(err => console.log(err))




