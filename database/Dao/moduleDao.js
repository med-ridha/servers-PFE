import modules from '../module/module.js'

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

      await modules.findOneAndUpdate({ _id: moduleId, "categories._id": categorieId },
        { "$pull": { "categories.$.documentsIds": documentId } })
      let finalResult = await modules.updateOne({ _id: moduleId }, { '$set': {numDoc: numDoc} })
      res({ ok: finalResult })
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
      await modules.findOneAndUpdate({ _id: moduleId, "categories._id": categorieId },
        { "$push": { "categories.$.documentsIds": documentId } })
      let finalResult = await modules.updateOne({ _id: moduleId }, { '$set': {numDoc: numDoc} })
      res({ ok: finalResult })
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

  }
}

export default modulesDao
