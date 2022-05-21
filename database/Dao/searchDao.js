import searchModule from '../module/search.js';
import user from '../module/user.js';

let searchDao = {
  getAllSearch: async function() {
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
  getUserSearchH: async function(id) {
    let promise = new Promise(async (res, rej) => {
      let searchH = [];
      try {
        let oneUser = await user.findOne({ _id: id })
        if (!oneUser) {
          rej({
            "result": "error",
            "value": {
              "code": 404,
              "message": "user not found"
            }
          })
          return;
        }
        searchH = await searchModule.find({ email: oneUser.email });
        res({
          "result": "success",
          "value": {
            "code": 0,
            "message": searchH
          }
        })
      } catch (error) {
        rej({
          "result": "error",
          "value": {
            "code": 500,
            "message": error
          }
        })
        return;
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

export default searchDao;
