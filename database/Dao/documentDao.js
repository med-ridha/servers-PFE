import documents from '../module/document.js'
import moment from 'moment'
import modulesDao from '../Dao/moduleDao.js'
import userModule from '../module/user.js'
import modules from '../module/module.js'
import searchDoc from '../module/search.js'
import firebase from '../../firebase/service.js'
import searchModule from '../module/search.js'
//import { Client } from '@elastic/elasticsearch'

//const client = new Client({ node: 'http://localhost:9200' })

let documentDao = {
  getSearchAll: async function() {
    let promise = new Promise(async (res, rej) => {
      try {
        let searches = await searchModule.find({});
        res({ "result": 'success', value: { code: 0, message: searches } })
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
          if (body.docId) {
            for (let doc of result) {
              console.log(doc._id.toString() === body.docId)
              if (doc._id.toString() === body.docId) {
                res({ "result": 'not found', value: { code: 0, message: result } })
              }
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
        let someDocuments = await documents.find({ _id: { $in: listDocumentIds } });
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
        let r1 = await modulesDao.remDocFromCat(moduleId, categoryId, documentId);
        if (r1.result == "error") {
          rej({ "result": "error", value: { code: 4, result: r1.value.message } })
          return
        }
        await userModule.updateMany({ listfavored: { $all: [documentId] } }, { $pull: { listfavored: documentId } });
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
            await modulesDao.addDocToCat(moduleId, categoryId, result._id);
            await firebase.sendToTopic({ title: "new document", body: result.titleFr.substring(0, result.titleFr.length / 2) + '...' })
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
        if (updateResult.modifiedCount == 1) {
          await modulesDao.remDocFromCat(doc.moduleId, doc.categoryId, doc._id);
          await modulesDao.addDocToCat(moduleId, categoryId, doc._id);
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
  },

  search: async function(body) {
    let promise = new Promise(async (res, rej) => {

      let apresLe;
      let avantLe;
      if (body.apresLe) apresLe = new Date(body.apresLe).toISOString();
      if (body.avantLe) avantLe = new Date(body.avantLe).toISOString();
      try {
        //let allDocuments = await documents.find({ titleFr: { "$regex": body.search.toLowerCase() } })
        let someDocuments = [];
        if (body.avantLe && body.apresLe) {
          someDocuments = await documents.find({ datePublished: { $gt: apresLe, $lt: avantLe } });
        } else if (body.avantLe) {
          someDocuments = await documents.find({ datePublished: { $lt: avantLe } });
        } else if (body.apresLe) {
          someDocuments = await documents.find({ datePublished: { $gt: apresLe } });
        } else {
          someDocuments = await documents.find({});
        }
        let allDocuments = [];
        if (body.exacte) {
          allDocuments = someDocuments.filter(doc => doc.titleFr.toLowerCase().includes(body.search.toLowerCase()))
          allDocuments.push(...someDocuments.filter(doc => doc.titleAr.includes(body.search)))
        }
        else if (!body.exacte) {
          let args = body.search.split(" ");
          for (let word of args) {
            if (word.length <= 3) continue;
            //allDocuments.push(...someDocuments.filter(doc => doc.titleFr.toLowerCase().includes(word.toLowerCase())))
            //allDocuments.push(...someDocuments.filter(doc => doc.titleAr.includes(word)))
            allDocuments.push(...someDocuments.filter(doc => doc.titleFr.split(" ").join("").toLowerCase().includes(word.toLowerCase())))
            allDocuments.push(...someDocuments.filter(doc => doc.titleAr.split(" ").join("").includes(word)))
          }
        }
        let allSearchModules = await modules.find({});
        if (body.module) {
          for (let item of allSearchModules) {
            if (item.name == body.module) {
              allDocuments = allDocuments.filter(doc => doc.moduleId == item._id);
              if (body.category) {
                for (let cat of item.categories) {
                  if (cat.name == body.category) {
                    allDocuments = allDocuments.filter(doc => doc.categoryId == cat._id);
                  }
                }
              }
            }
          }
        }
        let listModulesIds = []
        let count = {};
        for (let item of allDocuments) {
          count[item.moduleId] = (count[item.moduleId] ?? 0) + 1;
          if (listModulesIds.includes(item.moduleId)) continue;
          listModulesIds.push(item.moduleId);
        }
        let allModules = await modules.find({ _id: { $in: listModulesIds } })
        let listModules = [];
        for (let item of allModules) {
          if (listModules.includes(item.name)) continue;
          listModules.push(item.name);
        }
        let data = [];
        for (let i = 0; i < allModules.length; i++) {
          for (let item of listModulesIds) {
            if (allModules[i]._id == item) {
              data.push({
                "name": allModules[i].name,
                "count": count[allModules[i]._id],
              })
              let listCategories = [];
              for (let cat of allModules[i].categories) {
                let found = false;
                for (let doc of allDocuments) {
                  if (cat.documentsIds.includes(doc._id)) {
                    for (let q = 0; q < listCategories.length; q++) {
                      if (listCategories[q].id == cat._id) found = true;
                    }
                    if (found == false)
                      listCategories.push({ name: cat.name, id: cat._id });
                  }
                }
              }
              for (let j = 0; j < data.length; j++) {
                if (data[j].name == allModules[i].name) {
                  data[j]['listCategories'] = listCategories;
                }
              }
            }
          }
        }
        let email = body.email;
        delete body['email'];
        (new searchDoc({
          email: email,
          searchString: JSON.stringify(body).toString(),
          dateSearch: moment.now(),
          foundResult: (data.length == 0) ? false : true
        })).save().then((_) => {
          res({ result: "success", value: { code: 0, message: data } })
        }).catch((error) => {
          rej({ "result": "error", "value": { code: 8, message: error } })

        })
      } catch (error) {
        console.log(error);
        rej({ "result": "error", "value": { code: 5, message: error } })
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }

  },

  getCategoriesSearch: async function(query, body) {
    let promise = new Promise(async (res, rej) => {
      let categories = body.categories;
      let listCatIds = [];
      for (let i = 0; i < categories.length; i++) {
        listCatIds.push(categories[i].id);
      }
      let apresLe;
      let avantLe;
      if (query.apresLe) apresLe = new Date(query.apresLe).toISOString();
      if (query.avantLe) avantLe = new Date(query.avantLe).toISOString();
      try {
        //let allDocuments = await documents.find({ titleFr: { "$regex": query.search.toLowerCase() } })
        let someDocuments = [];
        if (query.avantLe && query.apresLe) {
          someDocuments = await documents.find({ datePublished: { $gt: apresLe, $lt: avantLe } });
        } else if (query.avantLe) {
          someDocuments = await documents.find({ datePublished: { $lt: avantLe } });
        } else if (query.apresLe) {
          someDocuments = await documents.find({ datePublished: { $gt: apresLe } });
        } else {
          someDocuments = await documents.find({});
        }
        let allDocuments = [];
        if (query.exacte) {
          allDocuments = someDocuments.filter(doc => doc.titleFr.toLowerCase().includes(query.search.toLowerCase()))
          allDocuments.push(...someDocuments.filter(doc => doc.titleAr.includes(query.search)))
        }
        else if (!query.exacte) {
          let args = query.search.split(" ");
          for (let word of args) {
            allDocuments.push(...someDocuments.filter(doc => doc.titleFr.split(" ").join("").toLowerCase().includes(word.toLowerCase())))
            allDocuments.push(...someDocuments.filter(doc => doc.titleAr.split(" ").join("").includes(word)))
          }
        }
        let allSearchModules = await modules.find({});
        if (body.module) {
          for (let item of allSearchModules) {
            if (item.name == body.module) {
              allDocuments = allDocuments.filter(doc => doc.moduleId == item._id);
              if (body.category) {
                for (let cat of item.categories) {
                  if (cat.name == body.category) {
                    allDocuments = allDocuments.filter(doc => doc.categoryId == cat._id);
                  }
                }
              }
            }
          }
        }
        let cats = await modules.findOne({ "categories._id": { $in: listCatIds } })
        let r = [];
        for (let item of cats.categories) {
          if (listCatIds.includes(item._id.toString())) {
            r.push(item)
          }
        }
        for (let i = 0; i < r.length; i++) {
          r[i].documentsIds = [];
          for (let j = 0; j < allDocuments.length; j++) {
            if (allDocuments[j].categoryId == r[i]._id) {
              r[i].documentsIds.push(allDocuments[j]._id)
            }
          }
        }
        res({ result: "success", value: { code: 0, message: r } })
      } catch (error) {
        console.log(error);
        rej({
          result: "error",
          value: {
            code: 1,
            message: error
          }
        });
      }

    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },

}


export default documentDao
