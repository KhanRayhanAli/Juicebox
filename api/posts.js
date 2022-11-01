const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, getPostById, updatePost, createPost } = require('../db');
const { requireUser } = require('./utils');

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");

    next();
});

postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();

    res.send({
        posts
    });
});

postsRouter.post('/', requireUser, async (req, res, next) => {
    const { title, content, tags = "" } = req.body;

    const tagArr = tags.trim().split(/\s+/)
    const postData = {};

    if (tagArr.length) {
        postData.tags = tagArr;
    }

    try {
        // postData.add('authorId', title, content)
        const post = await createPost(postData);
        
        res.send({ post });
    } catch ({ name, message }) {
        next({ name, message });
    }
});


postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const {postId} = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
        updateFields.title = title;
    }

    if (content) {
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById(postId);
            console.log(originalPost, 'this is original')
        if (originalPost.author.id === req.user.id) {
            console.log("hi there")
            const updatedPost = await updatePost(postId, updateFields);
            console.log(updatedPost, 'this is updated')
            res.send({ post: updatedPost })
        } else {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot update a post that is not yours!'
            })
        }
    } catch ({ name, message }) {
        next({ name, message});
    }
});
module.exports = postsRouter;