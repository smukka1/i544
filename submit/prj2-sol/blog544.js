// -*- mode: JavaScript; -*-

import mongo from 'mongodb';

import BlogError from './blog-error.js';
import Validator from './validator.js';

//debugger; //uncomment to force loading into chrome debugger

/**
A blog contains users, articles and comments.  Each user can have
multiple Role's from [ 'admin', 'author', 'commenter' ]. An author can
create/update/remove articles.  A commenter can comment on a specific
article.

Errors
======

DB:
  Database error

BAD_CATEGORY:
  Category is not one of 'articles', 'comments', 'users'.

BAD_FIELD:
  An object contains an unknown field name or a forbidden field.

BAD_FIELD_VALUE:
  The value of a field does not meet its specs.

BAD_ID:
  Object not found for specified id for update/remove
  Object being removed is referenced by another category.
  Other category object being referenced does not exist (for example,
  authorId in an article refers to a non-existent user).

EXISTS:
  An object being created already exists with the same id.

MISSING_FIELD:
  The value of a required field is not specified.

*/

export default class Blog544 {

  constructor(meta, options,client,db) {
    //@TODO
	
    this.meta = meta;
    this.options = options;
    this.validator = new Validator(meta);
	this.client=client;
	this.db=db;
	
  }

  /** options.dbUrl contains URL for mongo database */
  static async make(meta, options) {
	//console.log("in make");
	//const url=options.dbUrl;
	/*console.log("abcccc"+options.dbUrl.split('/').slice(0,3));
	const url=options.dbUrl.split('/').slice(0,3).join('/');
	console.log("after splitting" +url);
	
	const proj_db=options.dbUrl.split('/').slice(3,4).join('/');
	console.log("dbbbb is"+proj_db);*/
	
	const url=options.dbUrl.slice(0,options.dbUrl.lastIndexOf('/'));
	//console.log("mongo url is " +url);
	const my_db=options.dbUrl.slice(options.dbUrl.lastIndexOf('/')+1,options.dbUrl.length);
	//console.log("db value is"+my_db);

	const client= await mongo.connect(url,MONGO_CONNECT_OPTIONS);
	//console.log("client value is"+client);
	const db=client.db(my_db);
	//console.log("db is"+db);
    //@TOD
    return new Blog544(meta, options,client,db);
  }

  /** Release all resources held by this blog.  Specifically, close
   *  any database connections.
   */
  async close() {
    //@TODO
	await this.client.close();
  }

  /** Remove all data for this blog */
  async clear() {
    //@TODO
	await this.db.collection("users").deleteMany({});
	await this.db.collection("articles").deleteMany({});
	await this.db.collection("comments").deleteMany({});
  }

  /** Create a blog object as per createSpecs and 
   * return id of newly created object 
   */
  async create(category, createSpecs) {
    const obj = this.validator.validate(category, 'create', createSpecs);
    //@TODO
	const users_collection=this.db.collection("users");
	const articles_collection=this.db.collection("articles");
	const comments_collection=this.db.collection("comments");

	if(category === 'users'){
		//const abc=this.db.collection("users");
		const exists= await this.db.collection("users").findOne({'id':obj.id});
		//console.log("exists is"+exists);
		
		if(exists === null){
			const ret= await users_collection.insertOne(obj);
			//console.log(obj.id);
			//console.log("ret is "+ret);
			return obj.id;

			//if(ret.id===obj.id){
				//return throw new EXISTS;
		}else{
				//return obj.id;
			//console.log("user exists");
			const msg=`${obj.id} exists in ${category}`;
			throw [new BlogError('EXISTS',msg)];
			
		}
		
	} 
	if(category === 'articles'){
		//const abc=this.db.collection("users");
		obj.id=generateArticleId();
		const ret= await articles_collection.insertOne(obj);
		//console.log ("result is"+ret);
		return obj.id;
	}
	if(category === 'comments'){
		//const abc=this.db.collection("users");
		obj.id=generateCommentId();
		const ret= await comments_collection.insertOne(obj);
		//console.log ("result is"+obj.id);
		return obj.id;
	}
	if(category !=='users' && category!=='comments' && category!=='articles'){
		const msg=`Bad category ${category}`;
		throw [new BlogError('BAD_CATEGORY',msg)];
	}
  }

  /** Find blog objects from category which meets findSpec.  
   *
   *  First returned result will be at offset findSpec._index (default
   *  0) within all the results which meet findSpec.  Returns list
   *  containing up to findSpecs._count (default DEFAULT_COUNT)
   *  matching objects (empty list if no matching objects).  _count .
   *  
   *  The _index and _count specs allow paging through results:  For
   *  example, to page through results 10 at a time:
   *    find() 1: _index 0, _count 10
   *    find() 2: _index 10, _count 10
   *    find() 3: _index 20, _count 10
   *    ...
   *  
   */
  async find(category, findSpecs={}) {
    const obj = this.validator.validate(category, 'find', findSpecs);
	//console.log("object isssss"+typeof(obj._count));
    var result;
    //@TODO
	if(category==='users'){
		if(obj.id){
			result= await this.db.collection("users").find({'id':obj.id}).toArray();
			//console.log(result);
		}else if(obj.email){
			result= await this.db.collection("users").find({'email':obj.email}).toArray();
		}else if(obj.firstName){
			result= await this.db.collection("users").find({'firstName':obj.firstName}).toArray();
		}else if(obj.lastName){
			result= await this.db.collection("users").find({'lastName':obj.lastName}).toArray();
		}else if(obj._count){
			result= await this.db.collection("users").find().sort({'creationTime':-1}).limit(parseInt(obj._count)).toArray();
		}else if(obj.creationTime){
			result= await this.db.collection("users").find({'creationTime':{$lte:obj.creationTime}}).sort({'creationTime':-1}).limit(DEFAULT_COUNT).toArray();
		}else{
			//console.log("inside else");
			result= await this.db.collection("users").find().sort({'creationTime':-1}).limit(DEFAULT_COUNT).toArray();
		}
		
	}
	if(category==='articles'){
		if(obj.id){
			result= await this.db.collection("articles").find({'id':obj.id}).toArray();
		}else if(obj.authorId){
			result= await this.db.collection("articles").find({'authorId':obj.authorId}).toArray();
		}else if(obj.keywords){
			result= await this.db.collection("articles").find({'keywords':obj.keywords}).toArray();
		}else if(obj.creationTime){
			result= await this.db.collection("articles").find({'creationTime':{$lte:obj.creationTime}}).sort({'creationTime':-1}).limit(DEFAULT_COUNT).toArray();
		}
	}
	if(category==='comments'){
		if(obj.id){
			result= await this.db.collection("comments").find({'id':obj.id}).toArray();
		}else if(obj.articleId){
			result= await this.db.collection("comments").find({'articleId':obj.articleId}).toArray();
		}else if(obj.commenterId){
			result= await this.db.collection("comments").find({'commenterId':obj.commenterId}).toArray();
		}else if(obj.creationTime){
			result= await this.db.collection("comments").find({'creationTime':{$lte:obj.creationTime}}).sort().limit(DEFAULT_COUNT).toArray();
		}
	}
	if(category !=='users' && category!=='comments' && category!=='articles'){
		//const msg='Bad/unknown category';
		const msg=`Bad category ${category}`;
		throw [new BlogError('BAD_CATEGORY',msg)];
	}
	if(result.length>0){
       	    //console.log("not null"+result);
		//const obj=Object.assign({},result);
		for(var i=0; i<result.length;i++){
			delete result[i]._id;
		}
	    	//return obj.toArray();

		return result;
	}else{
		//console.log("null")
		const msg=`${obj.id} not found in ${category}`;
		//const msg='not found';
		throw [new BlogError('BAD_ID',msg)];
	}
  }

  /** Remove up to one blog object from category with id == rmSpecs.id. */
  async remove(category, rmSpecs) {
    const obj = this.validator.validate(category, 'remove', rmSpecs);
	var result,find,temp;
    //@TODO
	if(category==='users'){
		if(obj.id){
			find= await this.db.collection("articles").find({'authorId':obj.id}).toArray();
			if(find.length===0){
				temp=await this.db.collection("users").findOne({'id':obj.id});
				//console.log("in remove"+temp._id);
				if(temp!==null){
					result= await this.db.collection("users").deleteOne({'_id':temp._id});
				}else{
					const msg=`${obj.id} not found in ${category}`;
					throw [new BlogError('BAD_ID',msg)];
				}
			}else{
				//const msg='being reffered in another category';
				const msg=`${obj.id} is being reffered in another category`;
				throw [new BlogError('BAD_ID',msg)];
			}
		}
	}
	if(category==='comments'){
		if(obj.id){
			temp=await this.db.collection("comments").findOne({'id':obj.id});
			if(temp!==null){
				result= await this.db.collection("comments").deleteOne({'_id':temp._id});
			}else{
				//const msg='not found in data';
				const msg=`${obj.id} not found in ${category}`;
				throw [new BlogError('BAD_ID',msg)];
			}
		}
	}
	if(category==='articles'){
		if(obj.id){
			find= await this.db.collection("comments").find({'articleId':obj.id}).toArray();
			if(find.length===0){
				temp=await this.db.collection("articles").findOne({'id':obj.id});
				if(temp!==null){
					result= await this.db.collection("articles").deleteOne({'_id':temp._id});
				}else{
					//const msg='not found in data';
					const msg=`${obj.id} not found in ${category}`;//
					throw [new BlogError('BAD_ID',msg)];
				}
			}else{
				//const msg='being reffered in another category';
				const msg=`${obj.id} is being reffered in another category`;
				throw [new BlogError('BAD_ID',msg)];
			}
		}
	}
  }

  /** Update blog object updateSpecs.id from category as per
   *  updateSpecs.
   */
  async update(category, updateSpecs) {
    const obj = this.validator.validate(category, 'update', updateSpecs);
	var result;
	const set=Object.assign({},obj);
    //@TODO
	if(category==='users'){
		if(obj.id){
			result= await this.db.collection("users").findOne({'id':obj.id});
			if(result!==null){
				//console.log("inside if"+obj);
				await this.db.collection("users").updateOne({'_id' : result._id},{$set:set});
			}else{
					//const msg='not found in data';
					const msg=`${obj.id} not found in ${category}`;
					throw [new BlogError('BAD_ID',msg)];
				}
		}
	}
	if(category==='comments'){
		if(obj.id){
			result= await this.db.collection("comments").findOne({'id':obj.id});
			if(result!==null){
				//console.log("inside if"+obj);
				await this.db.collection("comments").updateOne({'id' : obj.id},{$set:set});
			}else{
					//const msg='not found in data';
					const msg=`${obj.id} not found in ${category}`;
					throw [new BlogError('BAD_ID',msg)];
				}
		}
	}
	if(category==='articles'){
		if(obj.id){
			result= await this.db.collection("articles").findOne({'id':obj.id});
			if(result!==null){
				//console.log("inside if"+obj);
				await this.db.collection("articles").updateOne({'id' : obj.id},{$set:set});
			}else{
					//const msg='not found in data';
					const msg=`${obj.id} not found in ${category}`;
					throw [new BlogError('BAD_ID',msg)];
				}
		}
	}
  }
  
}

const DEFAULT_COUNT = 5;

const MONGO_CONNECT_OPTIONS = { useUnifiedTopology: true };

function generateArticleId(){
	var a1=Math.floor(Math.random()*100);
	var a2=Math.floor(Math.random()*100000);
	return a1 + "." + a2 ;
}

function generateCommentId(){
//	return Math.random();
	var c1=Math.floor(Math.random()*1000);
	var c2=Math.floor(Math.random()*100000);
	return c1 + "." + c2 ;
}
