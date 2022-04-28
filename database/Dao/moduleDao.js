import modules from '../module/module.js'
import moment from 'moment'
import documents from '../module/document.js'

let modulesDao = {
  getAll: async function() {
    let promise = new Promise(async (res, rej) => {
      try {
        let allModules = await modules.find({});
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": allModules
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
  remDocFromCat: async function(moduleId, categorieId, documentId) {
    let promise = new Promise(async (res, rej) => {
      let mod = await modules.findOne({ _id: moduleId })
      let numDoc = mod.numDoc - 1;
      console.log(numDoc)
      try {
        await modules.findOneAndUpdate({ _id: moduleId, "categories._id": categorieId }, { "$pull": { "categories.$.documentsIds": documentId } })
        let finalResult = await modules.updateOne({ _id: moduleId }, { '$set': { numDoc: numDoc } })
        res({ "result": "success", value: { code: 0, message: finalResult } })
      } catch (error) {
        rej({ "result": "error", value: { code: 1, message: error } })
      }
    })
    try {
      let result = await promise;
      console.log(result)
      return result;
    } catch (error) {
      console.log(error)
      return error;
    }
  },
  addDocToCat: async function(moduleId, categorieId, documentId) {
    let promise = new Promise(async (res, rej) => {
      let mod = await modules.findOne({ _id: moduleId })
      let numDoc = mod.numDoc + 1;
      console.log(numDoc)
      try {
        await modules.findOneAndUpdate({ _id: moduleId, "categories._id": categorieId },
          { "$push": { "categories.$.documentsIds": documentId } })
        let finalResult = await modules.updateOne({ _id: moduleId }, { '$set': { numDoc: numDoc } })
        res({ "result": "success", value: { code: 0, message: finalResult } })
      } catch (error) {
        rej({ "result": "error", value: { code: 0, message: error } })
      }
    })
    try {
      let result = await promise;
      console.log(result)
      return result;
    } catch (error) {
      console.log(error)
      return error;
    }
  },
  addCategory: async function(id, name) {
    let promise = new Promise(async (res, rej) => {
      try {
        let result = await modules.findOne({ id: id });
        if (!result) rej({ result: "error", value: { code: 2, message: "module not found" } })
        await modules.updateOne({ id: id }, { $push: { categories: { name: name } } })
        let updated = await modules.findOne({ id: id });
        console.log(updated);
        for (let category of updated.categories) {
          if (category.name === name)
            res({ "result": "success", value: { code: 0, message: category._id } })
        }
        rej({ "result": "error", value: { code: 0, message: "not found" } })
      } catch (error) {
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
  addModule: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let id = body.number;
      let name = body.name;

      (new modules({
        id: id,
        name: name,
        numDoc: 0,
        categorieId: []
      })).save()
        .then(_ => {
          let result = {
            result: "success",
          }
          res(result);
        })
        .catch((error) => {
          let result = {
            result: "error",
            value: error
          }
          rej(result);
        });
    })

    try {
      let result = await promise;
      return result;
    } catch (error) {
      return error;
    }
  },
  getModuleById: async function(id) {
    let promise = new Promise(async (res, rej) => {
      try {
        let result = await modules.findOne({ _id: id });
        res({
          result: "success",
          value: {
            code: 0,
            message: result
          }
        });
      } catch (error) {
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
  getModule: async function(id) {
    let promise = new Promise(async (res, rej) => {
      try {
        let result = await modules.findOne({ id: Number(id) });
        res({
          result: "success",
          value: {
            code: 0,
            message: result
          }
        });
      } catch (error) {
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
  getCategoriesLatest: async function(duree, body) {
    let promise = new Promise(async (res, rej) => {
      let time = new Date(moment.now() - (86400000 * duree)).toISOString();
      let categories = body.categories;
      let listCatIds = [];
      for (let i = 0; i < categories.length; i++) {
        listCatIds.push(categories[i].id);
      }
      try {
        let result = await documents.find({ categoryId: { $in: listCatIds }, dateAdded: { $gt: time } })
        let cats = await modules.findOne({ "categories._id": { $in: listCatIds } })
        let allDocuments = await documents.find({ dateAdded: { $gt: time } })
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

  getModulesLatest: async function(body) {
    let promise = new Promise(async (res, rej) => {
      let duree = body.duree;
      let time = new Date(moment.now() - (86400000 * duree)).toISOString();
      try {
        let allDocuments = await documents.find({ dateAdded: { $gt: time } })
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
        console.log(data);
        res({ result: "success", value: { code: 0, message: data } })
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
}

export default modulesDao
