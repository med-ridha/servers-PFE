import documents from '../module/document.js'
import moment from 'moment'
import modulesDao from '../Dao/moduleDao.js'
import userModule from '../module/user.js'
import modules from '../module/module.js'
import searchDoc from '../module/search.js'
import firebase from '../../firebase/service.js'
import searchModule from '../module/search.js'
import elastic from '../../elasticsearch/elastic.js'
let documentDao = {
  findDocument: async function(body) {
    let promise = new Promise(async (res, rej) => {
      try {
        let allDocuments = [];
        if (body.search) {
          allDocuments = (await documents.find({})).filter(doc => doc.titleFr.toLowerCase().includes(body.search.toLowerCase()));
          if (body.module && body.module.length > 0) {
            let mod = await modules.findOne({ id: body.module });
            allDocuments = allDocuments.filter(doc => doc.moduleId.toString() === mod._id.toString())
          }
        } else if (body.module && body.module.length > 0) {
          let mod = await modules.findOne({ id: body.module });
          allDocuments = (await documents.find({})).filter(doc => doc.moduleId.toString() === mod._id.toString());
        } else {
          allDocuments = await documents.find({})
        }

        res({ "result": 'success', value: { code: 0, message: allDocuments } })
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
        if (body.docId){
          let documentToUpdate = await documents.findOne({_id: body.docId})
          if (!documentToUpdate)
            rej({ "result": "error", "value": { code: 4, message: "document not found" } })
        }
        if (result.length > 0) {
          if (body.docId) {
            for (let doc of result) {
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
        await elastic.deleteDocument(documentId);
        let r2 = await documents.findOneAndDelete({ _id: documentId })
        res({ "result": 'success', value: { code: 0, result: r2 } })

      } catch (error) {
        console.log(error)
        rej({ "result": "error", value: { code: 5, result: error } })
      }
    })
    try {
      let result = await promise;
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
            await elastic.addDocToElastic(result);
            let mod = await modules.findOne({ _id: moduleId });
            await firebase.sendToTopic({ title: `Nouveau document ${mod.name}`, body: result.titleFr, id: result._id, module: mod.name, category: categoryName })
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
        console.log(error)
        rej({ result: "error", value: { code: 2, message: error } })
      }
    })

    try {
      let result = await promise;
      return result;
    } catch (err) {
      console.log(err)
      return err;
    }
  },

  updateDocument: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let docId = body.docId; let doc = await documents.findOne({ _id: docId });
      if (!doc) { rej({ result: "error", value: { code: 4, message: "document not found" } }); return; }
      let payload = body.payload; let moduleNum = payload.moduleNum;
      let moduleId = ""; let categoryId = ""; let found = false
      let categoryName = payload.categoryName;
      try {
        let modP = await modulesDao.getModule(moduleNum);
        let mod = modP.value.message;
        moduleId = mod._id;
        for (let category of mod.categories) {
          if (category.name === categoryName) { found = true; categoryId = category._id; }
        }
        if (!found) {
          let result = await modulesDao.addCategory(moduleNum, categoryName)
          categoryId = result.value.message;
        }
        let data = { titleFr: payload.titleFr, bodyFr: payload.bodyFr, titleAr: payload.titleAr, bodyAr: payload.bodyAr, ref: payload.ref, dateP: body.dateP, categoryId: categoryId, moduleId: moduleId }
        await documents.updateOne({ _id: docId }, data)
        let updateDocument = await documents.findOne({ _id: docId });
        await elastic.addDocToElastic(updateDocument);
        await modulesDao.remDocFromCat(doc.moduleId, doc.categoryId, doc._id);
        await modulesDao.addDocToCat(moduleId, categoryId, doc._id);
        res({ result: "success", value: { code: 0, message: "updated" } })
      } catch (error) {
        rej({ result: "error", value: { code: 2, message: JSON.stringify(error) } })
      }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      console.log(err)
      return err;
    }
  },

  search: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let apresLe; if (body.apresLe) apresLe = new Date(body.apresLe).toISOString();
      let avantLe; if (body.avantLe) avantLe = new Date(body.avantLe).toISOString();
      try {
        let someDocuments = [];
        if (body.avantLe && body.apresLe) { someDocuments = await documents.find({ datePublished: { $gt: apresLe, $lt: avantLe } }) }
        else if (body.avantLe) { someDocuments = await documents.find({ datePublished: { $lt: avantLe } }) }
        else if (body.apresLe) { someDocuments = await documents.find({ datePublished: { $gt: apresLe } }) }
        else { someDocuments = await documents.find({}) }
        let allDocuments = [];
        if (body.exacte) {
          allDocuments = someDocuments.filter(doc => doc.titleFr.toLowerCase().includes(body.search.toLowerCase()))
          allDocuments.push(...someDocuments.filter(doc => doc.titleAr.includes(body.search)))
        }
        else if (!body.exacte) {
          let elasticresult = await elastic.search(body.search)
          allDocuments = someDocuments.filter(doc => elasticresult.includes(doc._id.toString()))
        }
        let data = await this.getModulesForSearch(allDocuments, body);
        let email = body.email; delete body['email'];
        (new searchDoc({ 
          email: email,
          searchString: JSON.stringify(body).toString(),
          dateSearch: moment.now(),
          foundResult: (data.length == 0) ? false : true 
        }))
          .save().then((_) => { res({ result: "success", value: { code: 0, message: data } }) })
          .catch((error) => { rej({ "result": "error", "value": { code: 8, message: error } }) })
      } catch (error) { rej({ "result": "error", "value": { code: 5, message: error } }) }
    })
    try {
      let result = await promise;
      return result;
    } catch (err) {
      return err;
    }
  },

  getModulesForSearch: async function(allDocuments, body) {
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
          data.push({ "name": allModules[i].name, "count": count[allModules[i]._id], })
          let listCategories = [];
          for (let cat of allModules[i].categories) {
            let found = false;
            for (let doc of allDocuments) {
              if (cat.documentsIds.includes(doc._id)) {
                for (let q = 0; q < listCategories.length; q++) { if (listCategories[q].id == cat._id) found = true; }
                if (found == false) listCategories.push({ name: cat.name, id: cat._id, });
              }
            }
          }
          for (let q = 0; q < listCategories.length; q++) {
            let listDocumentIds = [];
            for (let doc of allDocuments) {
              if (listCategories[q].id.toString() === doc.categoryId.toString()) {
                listDocumentIds.push(doc._id)
              }
            }
            listCategories[q]['documentsIds'] = listDocumentIds;
          }
          for (let j = 0; j < data.length; j++) {
            if (data[j].name == allModules[i].name) {
              data[j]['listCategories'] = listCategories;
            }
          }
        }
      }
    }
    return data;
  }
}


export default documentDao
