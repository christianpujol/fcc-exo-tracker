// test suite https://pricey-hugger.glitch.me/
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const shortid = require("shortid")

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
const Schema = mongoose.Schema;

let userSchema = new Schema(
  {
    _id: {
      type: String,
      index: true,
      default: shortid.generate
    },
    username: {
      type: String,
      required: true
    }
  }
)
let exerciseSchema = new Schema(
  {
    userId: {
      type: String,
      required: true
    },
    description: String,
    duration:Number,
    date: {
      type: Date,
      default: Date.now
    }
  }
)
 
 const User = mongoose.model('User', userSchema)
 const Exercise = mongoose.model('Exercise', exerciseSchema)

app.use(cors())

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//POST /api/exercise/new-user
app.post("/api/exercise/new-user", (req, res) => {
  User.findOne({username: req.body.username}, (e, data) => {
    if (data) {
    return res.status(400).json({
      "error": "Username already in use",
      "username":data.username,
      "_id":data._id
    })
    }
    const user = new User(req.body)
    user.save((e, d) => {
      return res.json({"username": d.username, "_id": d._id})
    })
  })
})

app.get('/api/exercise/users', (req,res,next) => {
  User.find({}, (err, data) => {
    if (err) return next(err)
    const response = data.map(d => {
      const o = d.toObject()
      delete o.__v
      return o
    })
    return res.json(response)
  })
})

//POST /api/exercise/add
app.post("/api/exercise/add", (req, res, next) => {
  const exo = req.body
  exo.date = exo.date ? exo.date : new Date()
  
  
  User.findOne({_id: exo.userId}, (err, data) => {
    if (err) return next(err)
    if (!data) {
    return res.status(400).json({"error": "User Not Found"})
    }
  
    const exercise = new Exercise(exo)
    exercise.save((e, d) => {
      if (e) return next(e)
      
      const response = data.toObject()
      response.description = d.description,
      response.duration = d.duration,
      response.date = d.date 
      delete response.__v

      return res.json(response)
    })
  })
})

//GET /api/exercise/log?{userId}[&from][&to][&limit]
app.get("/api/exercise/log", (req, res, next) => {
  const query = req.query
  if (query.userId === undefined) {
    return res.status(400).json({"error": "No User Id"})
  }
  User.findOne({_id: query.userId}, (e, d) => {
    if (e) return next(e)
    if (!d) {
      return res.status(400).json({"error": "User Not Found"})
    }
    const q = {
      userId : query.userId
    }
    if (query.from || query.to) {
      q.date = {}
      if (query.to) q.date.$lt = new Date(query.to)
      if (query.from) q.date.$gt = new Date(query.from)
    }
    Exercise.find(q)
      .sort("date")
      .lean()
      .limit(parseInt(query.limit))
      .exec((err, data) => {
        const response = d.toObject()
        delete response.__v
        if (err) return next(err)
        response.count = data.length
        response.log = data.map(datum => {
          return{
          "description":datum.description,
          "duration": datum.duration,
          "date": datum.date
          }
        })
        return res.json(response)
    })
  })
})

// Not found middleware
app.use((req, res, next) => {
  return res.status(400).send('404 Not Found')
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(`${errCode} ${errMessage}`)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
