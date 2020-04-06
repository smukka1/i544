import assert from 'assert';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import querystring from 'querystring';

import BlogError from './blog-error.js';

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

export default function serve(port, meta, model) {
  const app = express();
  app.locals.port = port;
  app.locals.meta = meta;
  app.locals.model = model;
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}

function setupRoutes(app) {
  app.use(cors());
  app.use(bodyParser.json());
  //@TODO

const metaKeys=Object.keys(app.locals.meta);
//console.log(metaKeys);
app.get('/',doEmpty(app));
app.get('/meta',doMeta(app));
for(const category in metaKeys){
//console.log('/'+metaKeys[category]);
app.get('/'+metaKeys[category],getCategory(app,metaKeys[category]));
}
//app.get('/articles',getCategory(app));
//app.get('/comments',getCategory(app));
for(const category in metaKeys){
app.get('/'+metaKeys[category]+'/:id',getCategoryById(app,metaKeys[category]));
}
for(const category in metaKeys){
app.post('/'+metaKeys[category],createCategory(app,metaKeys[category]));
}
for(const category in metaKeys){
app.patch('/'+metaKeys[category]+'/:id',updateCategory(app,metaKeys[category]));
}
for(const category in metaKeys){
app.delete('/'+metaKeys[category]+'/:id',deleteCategory(app,metaKeys[category]));
}
//app.get('/articles/:id',getCategoryById(app));
//app.get('/comments/:id',getCategoryById(app));
}

/****************************** Handlers *******************************/

//@TODO
function doEmpty(app){
	return errorWrap( async function(req,res){
		const results={};
		results.links=[];
		try{
			//const results =  await app.locals.port;

			results.links.push(getselfLink(req));
			results.links.push({name:"describe body", rel:"meta",url:requestUrl(req) + '/meta'});
			results.links.push({name:"collection", rel:"users",url:requestUrl(req) + '/users'});
			results.links.push({name:"collection", rel:"articles",url:requestUrl(req) + '/articles'});
			results.links.push({name:"collection", rel:"comments",url:requestUrl(req) + '/comments'});
			res.json(results);
		}catch(err){
			const mapped= mapError(err);
			res.status(mapped.status).json(mapped);
		}
	});
}

function doMeta(app){
	return errorWrap( async function(req,res){
		const q= req.query || {}
		try{
			const results =  await app.locals.meta;
			results.links=[];
			results.links.push(getselfLink(req));
			res.json(results);
		}catch(err){
			const mapped= mapError(err);
			res.status(mapped.status).json(mapped);
		}
	});
}


function getCategory(app,cat){
	return errorWrap( async function(req,res){

		const q= req.query || {}
		var results_final={};
		var links=[];
		try{
			const results =  await app.locals.model.find(cat,q);
			/*for(let i in results){
			console.log('iddddddddd',i.id,results[i].id);
			console.log(requestUrl(req) + '/' +results[i].id);
			links.push(getselfLink(req)+'/'+results[i].id);
			}
			console.log('linkssss',links);*/
			for(let i in results){

				results[i].links=[{name:"self", rel:"self",url:requestUrl(req) + '/' +results[i].id}];
			}
			results_final={[cat]:results};
			res.json(results_final);
			/*var url=requestUrl(req);
			var links=[{name:"self", rel:"rel", url:url}];
			//results.links.push(getselfLink(req));
			//res.links(results.links);
			//console.log(results.links);
			res_obj=results;
			res_obj.links=links;
			console.log(res_obj);
			//res.links(links);
			res.json(res_obj);
			//console.log(res);*/
		}catch(err){
			const mapped= mapError(err);
			res.status(mapped.status).json(mapped);
		}
	});
}

function getCategoryById(app,cat){
	return errorWrap( async function(req,res){
	const id=req.params.id;
	var results_final={};
	var links=[];
	 //results_final.links=[];
	
		try{
			const results =  await app.locals.model.find(cat,{id:id});
			links.push(getselfLink(req));
			results[0].links=links;
			//console.log('resultsss',results);
			/*results_final=results;
			results_final.links.push(getselfLink(req));
			results.links=[];
			results.links=(getselfLink(req));
			console.log('resultssss',results);
			links.push(getselfLink(req));
			results_final=results;
			results_final.links=links;
			console.log('resultsss_finalllll',results_final);*/
			results_final={[cat]:results};
			//console.log('resultsss finallll',results_final);
			//links.push(getselfLink(req));
			//results.links=links;
			//results_final.[cat][0].links=links;
			res.json(results_final);
			
		}catch(err){
			const mapped= mapError(err);
			res.status(mapped.status).json(mapped);
		}
	});
}


function createCategory(app,cat){
	return errorWrap( async function(req,res){

	const obj=req.body;
	//console.log(obj);

		try{
			const results =  await app.locals.model.create(cat,obj);
			res.append('Location', requestUrl(req) + '/' + obj.id);
			res.json(results);
		}catch(err){
			const mapped= mapError(err);
			res.status(mapped.status).json(mapped);
		}
	});
}



function updateCategory(app,cat){
	return errorWrap( async function(req,res){

	const id=req.params.id;
	//console.log(id);
	const patch=Object.assign({},req.body);
	patch.id=id;
	//console.log(patch);
		try{
			const results =  await app.locals.model.update(cat,patch);
			res.json(results);
		}catch(err){
			const mapped= mapError(err);
			res.status(mapped.status).json(mapped);
		}
	});
}


function deleteCategory(app,cat){
	return errorWrap( async function(req,res){

	const id=req.params.id;
		try{
			const results =  await app.locals.model.remove(cat,{id:id});
			res.json(results);
		}catch(err){
			const mapped= mapError(err);
			res.status(mapped.status).json(mapped);
		}
	});
}


function getselfLink(req){
	var url=requestUrl(req);
	var selfLink={name:"self", rel:"self",url:url};
	return selfLink;
}


/**************************** Error Handling ***************************/

/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    res.status(SERVER_ERROR);
    res.json({ code: 'SERVER_ERROR', message: err.message });
    console.error(err);
  };
}

/** Set up error handling for handler by wrapping it in a 
 *  try-catch with chaining to error handler on error.
 */
function errorWrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    }
    catch (err) {
      next(err);
    }
  };
}

const ERROR_MAP = {
  BAD_CATEGORY: NOT_FOUND,
  EXISTS: CONFLICT,
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code.
 */
function mapError(err) {
  console.error(err);
  return (err instanceof Array && err.length > 0 && err[0] instanceof BlogError)
    ? { status: (ERROR_MAP[err[0].code] || BAD_REQUEST),
	code: err[0].code,
	message: err.map(e => e.message).join('; '),
      }
    : { status: SERVER_ERROR,
	code: 'INTERNAL',
	message: err.toString()
      };
} 

/****************************** Utilities ******************************/

/** Return original URL for req (excluding query params)
 *  Ensures that url does not end with a /
 */
function requestUrl(req) {
  const port = req.app.locals.port;
  const url = req.originalUrl.replace(/\/?(\?.*)?$/, '');
  return `${req.protocol}://${req.hostname}:${port}${url}`;
}


const DEFAULT_COUNT = 5;

//@TODO
