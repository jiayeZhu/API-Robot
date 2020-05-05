const express = require('express')
const UserRouter = express.Router()
const { UserModel } = require("../models")
const config = require('config')
const MODEL_NAME = 'User'

// Post: Create
UserRouter.post('/', async (req, res) => {
  let User = new UserModel(req.body)
  try {
    let { _id } = await User.save()
    res.set('Location', `${config.get('Resources').LocationBase}/${MODEL_NAME.toLowerCase()}/${_id}`)
    return res.sendStatus(201) //201 Created: The request has been fulfilled, resulting in the creation of a new resource.
  } catch (error) {
    console.error(`create ${MODEL_NAME} failed with error: `, error.message)
    return res.sendStatus(500)
  }
})

// Get: query list
UserRouter.get('/', async (req, res) => {
  try {
    let UserList = await UserModel.find().exec()
    return res.send(UserList)
  } catch (error) {
    console.error(`get ${MODEL_NAME} list failed with error: `, error.message)
    return res.sendStatus(500)
  }
})

// Get: query one resource
UserRouter.get('/:_id', async (req, res) => {
  let _id = req.params
  try {
    let User = await UserModel.findById(_id).exec()
    return res.send(User)
  } catch (error) {
    console.error(`get ${MODEL_NAME} By Id: ${id} failed with error: `, error.message)
    return res.sendStatus(500)
  }
})

// Put: update the WHOLE document
UserRouter.put('/:_id', async (req, res) => {
  let { _id } = req.params
  try {
    await UserModel.findByIdAndUpdate(_id,req.body,{overwrite:true}).exec()
    return res.sendStatus(204) //204 No Content: The server successfully processed the request and is not returning any content.
  } catch (error) {
    console.error(`replace ${MODEL_NAME}: ${_id} failed with error: `, error.message)
    return res.sendStatus(500)
  }
})

// Patch: update part of the document
UserRouter.patch('/:_id', async(req,res)=>{
  let {_id} = req.params
  console.log(req.body)
  try {
    await UserModel.findByIdAndUpdate(_id,req.body).exec()
    return res.sendStatus(204)
  } catch (error) {
    console.error(`patch ${MODEL_NAME}: ${_id} failed with error: `, error.message)
  }
})

// Delete: delete one resource
UserRouter.delete('/:_id', async (req, res) => {
  let { _id } = req.params
  try {
    await UserModel.findByIdAndRemove(_id).exec()
    return res.sendStatus(204) //204 No Content: The server successfully processed the request and is not returning any content.
  } catch (error) {
    console.error(`delete ${MODEL_NAME}: ${_id} failed with error: `, error.message)
    return res.sendStatus(500)
  }
})

module.exports = UserRouter