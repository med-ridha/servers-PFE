import documents from '../module/document.js'
import moduleDao from '../Dao/moduleDao.js'
import moment from 'moment'
import modulesDao from '../Dao/moduleDao.js'
let documentDao = {
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
        let mod = modP.value.message;
        if (!mod) rej({ result: "error", value: { code: 1, message: "module not found" } })
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
  }


}


export default documentDao
