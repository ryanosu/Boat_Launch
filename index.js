import dotenv from 'dotenv';
dotenv.config();
//const express = require('express');
import express from 'express';
import pkg from 'express-openid-connect';
const { requiresAuth } = pkg;
import pkg2 from 'express-openid-connect';
const {auth} = pkg2;
const app = express();
//const { Datastore } = require('@google-cloud/datastore'); // imports the Google Cloud client library
import {Datastore} from '@google-cloud/datastore';
//const bodyParser = require('body-parser');
import bodyParser from 'body-parser';
//const request = require('request');
import request from 'request';
const datastore = new Datastore(); // creates a Client
const BOATS = 'Boats'; // entity
const USERS = 'Users'; // entity
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const DOMAIN = process.env.DOMAIN;
const SITE = process.env.SITE;
//var { expressjwt: jwt } = require('express-jwt');
import {expressjwt } from 'express-jwt';
//var jwksRsa = require('jwks-rsa');
import jwksRsa from 'jwks-rsa';
//const { default: jwt_decode }  = require('jwt-decode');
import jwt_decode from 'jwt-decode';
app.use(bodyParser.json());
app.set('trust proxy', true);
//const login = express.Router();
const boats = express.Router();
const tests = express.Router();
const users = express.Router();
const main = express.Router();
const store = express.Router();
//const path = require('path');
import path from 'path';
const __dirname = path.resolve();
import cors from 'cors';
import pkg3 from 'express-session';
const {session} = pkg3;

//new
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
  })
);

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: SITE,
  secret: CLIENT_SECRET,
  clientID: CLIENT_ID
};

config.issuerBaseURL = DOMAIN;

app.use(auth(config));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

// Custom middleware to set global session data
app.use((req, res, next) => {
  // Set global session data
  res.locals.globalVar = "hi_1";
  // Continue to the next middleware or route
  next();
});

const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${DOMAIN}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  issuer: `https://${DOMAIN}/`,
  algorithms: ['RS256']
});

// -------------- MODEL ----------------- //
//                                        //
//                                        //
//                                        //
//                                        //
//                                        //
// -------------- MODEL ----------------- //

/* ------------- Fetch from Datastore -------------- */
function fromDatastore(item) {
  item.id = item[Datastore.KEY].id;
  return item;
};

/* ------------- POST 1 New User -------------------- */
function post_new_user(owner) {
  var key = datastore.key(USERS);
  const new_user = {"owner": owner};
  return datastore.save({ "key": key, "data": new_user }).then(() => { return key });
};

/* ------------- GET All Users ---------------------- */
function get_users() {
  const q = datastore.createQuery(USERS);
  return datastore.runQuery(q).then((entities) => {
  // Use Array.map to call the function fromDatastore. This function
  // adds id attribute to every element in the array at element 0 of
  // the variable entities
  return entities[0].map(fromDatastore);
  });
};

/* ------------- POST 1 Boat ----------------------- */
function post_boat(owner, type, date){
  var key = datastore.key(BOATS);
  const new_boat = {"owner": owner, "type": type, "date": date};
  return datastore.save({"key":key, "data":new_boat}).then(() => {return key});
};

/* ------------- GET All Boats (Collection URL) ---- */
function get_boats_pagination(req, owner){
  var q = datastore.createQuery(BOATS).filter("owner", "=", owner).limit(5);
  const results = {};
  if(Object.keys(req.query).includes("cursor")){
      q = q.start(req.query.cursor);
  }
return datastore.runQuery(q).then( (entities) => {
          results.items = entities[0].map(fromDatastore);
          if(entities[1].moreResults !== Datastore.NO_MORE_RESULTS ){
              results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor;
          }
    return results;
  });
}

/* ------------- GET 1 Boat ------------------------ */
function get_boat(id) {
  const key = datastore.key([BOATS, parseInt(id, 10)]);
  return datastore.get(key).then((entity) => {
      if (entity[0] === undefined || entity[0] === null) {
          // No entity found. Don't try to add the id attribute
          return entity;
      } 
      else {
          // Use Array.map to call the function fromDatastore. This function
          // adds id attribute to every element in the array entity
          return entity.map(fromDatastore);
      }
  });
};

/* ------------- UPDATE 1 Boat ---------------------- */
function put_boat(id, owner, type, date) {
  const key = datastore.key([BOATS, parseInt(id, 10)]);
  const patched_boat = {"owner": owner, "type": type, "date": date};
  return datastore.save({ "key": key, "data": patched_boat });
};

/* ------------- DELETE 1 Boat ---------------------- */
function delete_boat(id) {
  const key = datastore.key([BOATS, parseInt(id, 10)]);
  return datastore.delete(key);
};

/* ------------- GET All Users ---------------------- */
function get_store() {
  const q = datastore.createQuery('Store');
  return datastore.runQuery(q).then((entities) => {
    console.log("get_store was triggered");
  // Use Array.map to call the function fromDatastore. This function
  // adds id attribute to every element in the array at element 0 of
  // the variable entities
  return entities[0].map(fromDatastore);
  });
};

// -------------- CONTROLLER ------------ //
//                                        //
//                                        //
//                                        //
//                                        //
//                                        //
// -------------- CONTROLLER ------------ //

/* ------------- POST 1 Boat ----------------------- */
boats.post('/', checkJwt, function(req, res){
  if(req.get('content-type') !== 'application/json'){
      res.status(406).send('Server only accepts application/json data.')
  }
  // first, check for required attribute
  if (typeof req.body.type == 'undefined') {
      res.status(400).send('{"Error": "The request object is missing at least one of the required attributes"}');
    }
  // second, add the date
  let date = new Date()
  date = date.toDateString()

  post_boat(req.auth.sub, req.body.type, date)
  .then( key => {
      //res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/' + key.id);
      var data = {
          id: key.id,
          owner: req.auth.sub,
          type: req.body.type,
          date: date,
          self: req.protocol + '://' + req.get("host") + req.baseUrl + '/' + key.id
      }
      res.status(201).json(data)
  });
});

/* ------------- GET All of User's Boats ------------ */
boats.get('/', checkJwt, function(req, res){
  const boats = get_boats_pagination(req, req.auth.sub)
.then( (boats) => {
      res.status(200).json(boats);
  });
});

/* ------------- UPDATE 1 Boat --------------------- */
boats.put('/:id', checkJwt, function (req, res) {
  // validate that the content-type header (payload) is json
  if(req.get('content-type') !== 'application/json'){
    res.status(406).send('Server only accepts application/json data.')
  }
  // first, check for id match
  get_boat(req.params.id).then(boat => {
      if (boat[0] === undefined || boat[0] === null) {
          // The 0th element is undefined. This means there is no lodging with this id
          res.status(404).json({ 'Error': 'No boat with this boat_id exists' });
      }
      
      if(boat[0].owner !== req.auth.sub) {
          res.status(401).send();
          return
      }
      
  });
  // second, check for required attributes
  if (typeof req.body.type == 'undefined') {
    res.status(400).send('{"Error": "The request object is missing at least one of the required attributes"}');
  }

  // add the date
  let date = new Date()
  date = date.toDateString()
  
  // finally, if everything checks out, proceed to PUT
  put_boat(req.params.id, req.auth.sub, req.body.type, date).then(key => {res.status(303).send()});
});

/* ------------- DELETE 1 Boat ---------------------- */
boats.delete('/:id', checkJwt, function (req, res) {
  if(req.get('content-type') !== 'application/json'){
      res.status(406).send('Server only accepts application/json data.')
      return
  }
  get_boat(req.params.id).then(boat => {
      if (boat[0] === undefined || boat[0] === null) {
          // The 0th element is undefined. This means there is no boat with this id
          res.status(403).json({ 'Error': 'No boat with this boat_id exists' });
      }
      
      if(boat[0].owner !== req.auth.sub) {
          res.status(401).end();
          return
      }

      // call delete_boat model function
      delete_boat(req.params.id).then(res.status(204).end());
  });
});

/* ------------- GET All Users --------------------- */
users.get('/', function(req, res){
  const users = get_users()
.then( (users) => {
      res.status(200).json(users);
  });
});

/* ------------- POST 1 New User ------------------- */
users.post('/', function(req, res){
  const email = req.body.email;
  const password = req.body.password;

  var options = { method: 'POST',
          url: `https://${DOMAIN}/dbconnections/signup`,
          headers: { 'content-type': 'application/json' },
          body: { 
              grant_type: 'password',
              connection: 'Username-Password-Authentication',
              email: email,
              password: password,
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET },
              json: true };
  request(options, (error, response, body) => {
      if (error){
          res.status(500).send(error);
      } else {
          res.send(body);
      }
  });
});

/* ------------- LOGIN ----------------------------- */
// login.post('/', function(req, res){
//   const username = req.body.username;
//   const password = req.body.password;

//   var options = { method: 'POST',
//           url: `https://${DOMAIN}/oauth/token`,
//           headers: { 'content-type': 'application/json' },
//           body:
//            { grant_type: 'password',
//              username: username,
//              password: password,
//              client_id: CLIENT_ID,
//              client_secret: CLIENT_SECRET },
//           json: true };
//   request(options, (error, response, body) => {
//       if (error){
//           res.status(500).send(error);
//       } else {
//           var decoded_jwt = jwt_decode(body.id_token)
          
//           post_new_user(decoded_jwt.sub).then(func_response => {
//               var send_this = {"id_token": body["id_token"], "id": func_response.id}
//               res.send(send_this);
//           });
//       }
//   });
// });

/* ------------- LOGIN ----------------------------- */
// login.post('/auth', function(req, res){

// });

/* ------------- Test Route ------------------------ */
tests.get('/', (req, res) => {
  res.send('Hello from App Engine!');
});

// -------------- VIEW ------------------ //
//                                        //
//                                        //
//                                        //
//                                        //
//                                        //
// -------------- VIEW ------------------ //

main.get('/', (req, res) => {
  if (!req.oidc.isAuthenticated()){
    res.oidc.login({
      returnTo: "/trigger",
      authorizationParams: {
        screen_hint: "signup"
      },
    });
    //res.redirect("http://localhost:8080/login");
  }
  else {
    res.sendFile(path.join(__dirname, '/public/index.html'));
  }
});



// -------------- MISC ------------------ //
//                                        //
//                                        //
//                                        //
//                                        //
//                                        //
// -------------- MISC ------------------ //

store.get('/', function(req, res){
  const store = get_store()
  .then( (store) => {
    console.log("get route was triggered: " + store)
    res.status(200).json(store);
  });
});

// this happens immediately after login and right before redirect
main.get('/trigger', (req, res) => {
  // get the unique user ID
  var jwt = req.oidc.idToken;
  var decoded_jwt = jwt_decode(jwt);
  var decoded_sub = decoded_jwt.sub;
  console.log("decoded_sub: " + decoded_sub);
  res.redirect(SITE);
  // get where the arrow is currently pointing
  // const arrowPointing = req.body.arrowPointing;
  // decrement the store's boat
  // associate the boat with the corresponding user
});

main.post('/confirmbuttonsecond', (req, res) => {
  console.log("/confirmbuttonsecond triggered!");
  //console.log("decoded_sub: " + decoded_sub);
  console.log('Received Body:', req.body);
  var arrowTracker = req.body.arrowTracker
  console.log("arrowTracker: " + arrowTracker);
  res.status(200).send(arrowTracker);
});

const test_helper = () => {
  return 20;
}

//app.use('/login', login);
app.use('/boats', boats);
app.use('/tests', tests);
app.use('/users', users);
app.use('/store', store);
app.use('/', main);
app.use(express.static('public'))


// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

export default test_helper;