const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /tags");

    next();
});

tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();

    res.send({
        tags
    });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    // console.log(req.body, 'body')
    // const {tags} = req.body;
    // console.log(tags, 'tagz') 

    const {tagName} = req.params
try {
    const taggedPost = await getPostsByTagName(tagName);
    
    console.log(taggedPost, 'i am tagged post')
    res.send({ posts: taggedPost });

    // next({
    //     name: 'UnusedTagError',
    //     message: 'Tag could not be found!'
    // })

} catch ({ name, message }) {
    next ({ name, message }); 
}
});

module.exports = tagsRouter;