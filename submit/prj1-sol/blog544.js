// -*- mode: JavaScript; -*-

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

  constructor(meta, options) {
	    //@TODO
//console.log("in constructor");
    this.users= [];
    this.articles=[];
    this.comments=[];
    this.meta = meta;
    this.options = options;
    this.validator = new Validator(meta);
  }

  static async make(meta, options) {
    //@TODO
    return new Blog544(meta, options);

  }

  /** Remove all data for this blog */
  async clear() {
    //@TODO
	this.users=[];
	this.articles=[];
	this.comments=[];
  }

  /** Create a blog object as per createSpecs and 
   * return id of newly created object 
   */
  async create(category, createSpecs) {
	//console.log("in create method");
    const obj = this.validator.validate(category, 'create', createSpecs);
let found;
    //console.log(createSpecs);
    if(category === 'users'){

	for(var i in this.users){
		if(this.users[i].id===obj.id){
			found=1;
		}
		else{
			found=0;
		}
	}

	//if(this.find(this.users,{id:obj.id}).length>0){
	if(found===1){
		//console.log("inside if in create users");
		const msg= 'object with id ${obj.id} already exists for ${catogoty}';
		throw [new BlogError('EXISTS',msg)];
	}
	else{
    		this.users.push(obj);
    		return obj.id;
	}
	//}
    }
	
    if(category==='articles'){
	obj.id=generateArticleId();
	this.articles.push(obj);
	return obj.id;

     }

    if(category==='comments'){
	obj.id=generateCommentId();
	this.comments.push(obj);
        return obj.id;

     }
    //@TODO
  }

  /** Find blog objects from category which meets findSpec.  Returns
   *  list containing up to findSpecs._count matching objects (empty
   *  list if no matching objects).  _count defaults to DEFAULT_COUNT.
   */
  async find(category, findSpecs={}) {
    const obj = this.validator.validate(category, 'find', findSpecs);
//console.log(obj);
//console.log(obj.id);
//console.log(findSpecs);
//console.log(DEFAULT_COUNT);
let res=[];
    if(category === 'users'){
//for(var i=0; i<= DEFAULT_COUNT;i++){
    //console.log(this.users);
//}
let keys=Object.keys(obj);
//console.log(keys);
//let res=[];
var len=(this.users).length;


if(keys[0]==="id"){
//console.log("inside if");
//console.log("length is "+len);
//console.log(obj.id);
//for(var i=0;i<len; i++){
//console.log("inside for");
//if(keys.id===this.users.id)
//res.push(this.users[i]);
//res=this.users.filter(e=>e.id===obj.id);
//console.log(res);
for(var i in this.users){
//console.log("inside looping users");
if(this.users[i].id===obj.id){
	//console.log("found user");
	//console.log(this.users[i]);
	//res=this.users[i];
	res.push(this.users[i]);
	//console.log(res);
	return res;
}
}
//console.log(res);

//}
	
}

else if(keys[0]==="_count"){
//console.log("inside else iffff");
for(var i=0;i<obj._count;i++){
/*let j=0;
while(j<obj._count){
	res.push(this.users[i].id);
	j++;
	//console.log(res);
}*/
res[i]=(this.users[i]);
}
//console.log(res);
return res;
}

else if(keys[0]==="email"){
for(var i in this.users){
	if(this.users[i].email===obj.email){
	res.push(this.users[i]);
	//console.log(res);
}
}
return res;
}

else if(keys[0]==="firstName"){
for(var i in this.users){
	if(this.users[i].firstName===obj.firstName){
	res.push(this.users[i]);
	//console.log(res);
}
}
return res;
}

else if(keys[0]==="lastName"){
for(var i in this.users){
	if(this.users[i].lastName===obj.lastName){
	res.push(this.users[i]);
	//console.log(res);
}
}
return res;
}


else{
//console.log("in else");
for(var i=0;i<5;i++){
//console.log("in else inside for loop");
//console.log(this.users[i]);
res[i]=(this.users[i]);
//return res;
//console.log(this.res);

}
return res;
//console.log(this.users);
}
    }
    if(category === 'articles'){
    //console.log(this.articles);
	let keys=Object.keys(obj);
	if(keys[0]==='id'){
	//console.log("inside id if");
		for(var i in this.articles){
		//console.log("inside for");
			if(this.articles[i].id===obj.id){
			//console.log("article found");
			res.push(this.articles[i]);
			return res;
		}
	}
    }


	else if(keys[0]==='authorId'){
	//console.log("inside id if");
		for(var i in this.articles){
		//console.log("inside for");
			if(this.articles[i].authorId===obj.authorId){
			//console.log("article found");
			res.push(this.articles[i]);
			//return res;
		}
	}

return res;
}

else{
//console.log(this.articles);
}
}


   if(category === 'comments'){
	
	let keys=Object.keys(obj);
	if(keys[0]==='id'){
		for(var i in this.comments){
			if(this.comments[i].id=== obj.id){
				res.push(this.comments[i]);
				return res;
			}
		}
	}

	else if(keys[0]==='articleId'){
		for(var i in this.comments){
			if(this.comments[i].articleId=== obj.articleId){
				res.push(this.comments[i]);
				//return res;
			}
		}
		return res;
	}

	else if(keys[0]==='commenterId'){
		for(var i in this.comments){
			if(this.comments[i].commenterId=== obj.commenterId){
				res.push(this.comments[i]);
				//return res;
			}
		}
		return res;
	}
	else{
		
	//console.log(this.comments);
	}
    }
    //@TODO
    return [];
  }

  /** Remove up to one blog object from category with id == rmSpecs.id. */
  async remove(category, rmSpecs) {
    const obj = this.validator.validate(category, 'remove', rmSpecs);
    //@TODO
//var remove=[];
if(category==='users'){
for(var i in this.users){
if(this.users[i].id===obj.id){
	this.users[i]={};
}
}
}

if(category==='articles'){
for(var i in this.articles){
if(this.articles[i].id===obj.id){
	this.articles[i]={};
}
}
}

if(category==='comments'){
for(var i in this.comments){
if(this.comments[i].id===obj.id){
	this.comments[i]={};
}
}
}
//return remove;

  }

  /** Update blog object updateSpecs.id from category as per
   *  updateSpecs.
   */
  async update(category, updateSpecs) {
    const obj = this.validator.validate(category, 'update', updateSpecs);
	console.log(obj);
	let keys=Object.keys(obj);
	var update=[]
	if(category==='users'){
		//console.log("inside if");
		for(var i in this.users){
		//console.log("inside for");
			if(this.users[i].id===obj.id){
				//console.log("update lastname");
				//console.log(this.users[i]);
		if(keys[1]==='lastName'){
		this.users[i].lastName=obj.lastName;
		}
		if(keys[1]==='firstName'){
		this.users[i].firstName=obj.firstName;
		}
		if(keys[1]==='email'){
		this.users[i].email=obj.email;
		}
		//console.log(this.user[i].lastName);
				//return obj.lastName;
				//update[0]=this.user[i];
				//return update;
			}
		}
	}
    //@TODO

	if (category === 'articles'){
		for(var i in this.articles){
			if(this.articles[i].id===obj.id){

				if(keys[1]==='title'){
					this.articles[i].title=obj.title;
				}
				if(keys[1]==='content'){
					this.articles[i].content=obj.content;
				}
			}
		}
	}

	if(category === 'comments'){
		for(var i in this.comments){
			if(this.comments[i].id===obj.id){
				
				if(keys[1]==='content'){
					this.comments[i].content=obj.content;
				}
			}
		}

	}
  }
  
}

const DEFAULT_COUNT=5;

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
//You can add code here and refer to it from any methods in Blog544.
