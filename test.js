const { Sequelize, Model, DataTypes } = require('sequelize')

const sequelize = new Sequelize('Lab', 'root', 'mysql', {
  dialect: 'mysql',
  host:'192.168.1.170',
  port:32769
})

class User extends Model{}
User.init({
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  birthday: DataTypes.DATE
},{sequelize, modelName:'user'})

sequelize.sync()
  .then(()=> User.create({
    username:'janedoe',
    birthday: new Date(1980,6,20),
    password:'123123'
  }))
  .then(jane => {
    console.log(jane.toJSON())
  })