import documents from '../module/document.js'
import moduleDao from '../Dao/moduleDao.js'
import moment from 'moment'
import modulesDao from '../Dao/moduleDao.js'
import { Client } from '@elastic/elasticsearch'

//const client = new Client({ node: 'http://localhost:9200' })

let documentDao = {
  checkDocument: async function(body) {
    let titleFr = body.titleFr ?? null;
    let titleAr = body.titleAr ?? null;
    let bodyFr = body.bodyFr ?? null;
    let bodyAr = body.bodyAr ?? null;
    let promise = new Promise(async (res, rej) => {
      try {

        let result = await documents.find({
          $or: [
            { titleFr: titleFr },
            { titleAr: titleAr },
            { bodyFr: bodyFr },
            { bodyAr: bodyAr }
          ]
        })

        if (result.length > 0) {
          for (let doc of result) {
            if (doc._id.toString() === (body.docId ?? '')) {
              res({ "result": 'not found', value: { code: 0, message: result } })
            }

          }
          res({ "result": 'found', value: { code: 0, message: result } })
        }
        else
          res({ "result": 'not found', value: { code: 0, message: result } })

      } catch (error) {
        console.log(error);
        rej({ "result": "error", "value": { code: 1, message: error } })
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },
  getOne: async function(id) {
    let promise = new Promise(async (res, rej) => {
      try {
        let doc = await documents.findOne({ _id: id });
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": doc
          }
        })
      } catch (err) {
        rej({
          "result": "error",
          "value": {
            "code": 500,
            "message": err
          }
        })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },
  getSome: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let listDocumentIds = body.listDocumentIds;
      try {
        let someDocuments = await documents.find({_id: {$in : listDocumentIds}});
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": someDocuments 
          }
        })
      } catch (err) {
        rej({
          "result": "error",
          "value": {
            "code": 500,
            "message": err
          }
        })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  getAll: async function() {
    let promise = new Promise(async (res, rej) => {
      try {
        let allDocuments = await documents.find({});
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": allDocuments
          }
        })
      } catch (err) {
        rej({
          "result": "error",
          "value": {
            "code": 500,
            "message": err
          }
        })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  deleteDocument: async function(body) {
    let promise = new Promise(async (res, rej) => {

      let documentId = body.documentId;
      if (!documentId) {
        rej({ "result": "error", value: { code: 6, result: "missing values" } })
        return
      }
      try {
        let doc = await documents.findOne({ _id: documentId });
        if (!doc) {
          rej({ "result": "error", value: { code: 4, result: "document not found" } })
          return;
        }
        let moduleId = doc.moduleId;
        let categoryId = doc.categoryId;
        let r1 = await moduleDao.remDocFromCat(moduleId, categoryId, documentId);
        if (r1.result == "error") {
          rej({ "result": "error", value: { code: 4, result: r1.value.message } })
          return
        }

        let r2 = await documents.findOneAndDelete({ _id: documentId })
        res({ "result": 'success', value: { code: 0, result: r2 } })

      } catch (error) {
        console.log(error)
        rej({ "result": "error", value: { code: 5, result: error } })
      }
    })
    try {
      let result = await promise;
      console.log(result)
      return result;
    } catch (err) {
      console.log(err)
      return err;
    }
  },

  addDocument: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let titleFr = body.titleFr
      let bodyFr = body.bodyFr
      let titleAr = body.titleAr
      let bodyAr = body.bodyAr
      let ref = body.ref
      let dateAdded = moment.now()
      let dateP = body.dateP

      let moduleNum = body.moduleNum;
      let moduleId = "";
      let categoryId = "";
      let found = false
      let categoryName = body.categoryName;

      try {
        let modP = await modulesDao.getModule(moduleNum);
        if (modP.result == "error") {
          rej({ result: "error", value: { code: 1, message: "module not found" } })
          return;
        }
        let mod = modP.value.message;
        moduleId = mod._id;

        for (let category of mod.categories) {
          if (category.name === categoryName) {
            found = true;
            categoryId = category._id;
          }
        }

        if (!found) {
          let result = await modulesDao.addCategory(moduleNum, categoryName)
          console.log(result.value.message)
          categoryId = result.value.message;
        } else {
          console.log('category exists')
        }
        (new documents({
          moduleId: moduleId,
          categoryId: categoryId,
          titleFr: titleFr,
          bodyFr: bodyFr,
          titleAr: titleAr,
          bodyAr: bodyAr,
          ref: ref,
          dateAdded: dateAdded,
          datePublished: dateP
        })).save()
          .then(async result => {
            await moduleDao.addDocToCat(moduleId, categoryId, result._id);
            res({
              "result": "success",
              "value": {
                code: 0,
                message: result
              }
            });
          })
          .catch((error) => {
            rej({
              "result": "error",
              "value": { code: 1, message: error }
            });
          });
      } catch (error) {
        console.log("already there")
        console.log(error)
        rej({ result: "error", value: { code: 2, message: error } })
      }
    })

    try {
      let result = await promise;
      console.log(result)
      return result;
    } catch (err) {
      console.log(err)
      return err;
    }
  },

  updateDocument: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let docId = body.docId;
      let doc = await documents.findOne({ _id: docId });
      if (!doc) {
        rej({ result: "error", value: { code: 4, message: "document not found" } })
        return;
      }
      let payload = body.payload;

      let moduleNum = payload.moduleNum;
      let moduleId = "";
      let categoryId = "";
      let found = false
      let categoryName = payload.categoryName;

      try {
        let modP = await modulesDao.getModule(moduleNum);
        if (modP.result == "error") {
          rej({ result: "error", value: { code: 1, message: "module not found" } })
          return;
        }
        
        let mod = modP.value.message;
        moduleId = mod._id;

        for (let category of mod.categories) {
          if (category.name === categoryName) {
            found = true;
            categoryId = category._id;
          }
        }
        if (!found) {
          let result = await modulesDao.addCategory(moduleNum, categoryName)
          console.log(result.value.message)
          categoryId = result.value.message;
        } else {
          console.log('category exists')
        }


        let data = {
          titleFr: payload.titleFr,
          bodyFr: payload.bodyFr,
          titleAr: payload.titleAr,
          bodyAr: payload.bodyAr,
          ref: payload.ref,
          dateP: body.dateP,
          categoryId: categoryId,
          moduleId: moduleId
        }

        let updateResult = await documents.updateOne({ _id: docId }, data)
        if (updateResult.modifiedCount == 1){
          await moduleDao.remDocFromCat(doc.moduleId, doc.categoryId, doc._id);         
          await moduleDao.addDocToCat(moduleId, categoryId, doc._id);
        }
        res({ result: "success", value: { code: 0, message: JSON.stringify(updateResult) } })

      } catch (error) {
        console.log("already there")
        console.log(error)
        rej({ result: "error", value: { code: 2, message: JSON.stringify(error) } })
      }

    })

    try {
      let result = await promise;
      console.log(result)
      return result;
    } catch (err) {
      console.log(err)
      return err;
    }
  }


}


export default documentDao
