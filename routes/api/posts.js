const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const router = express.Router();

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

const validatePostInput = require('../../validation/post');

// @route GET api/posts/test
// @desc Tests posts route
// @access Public
router.get('/test', (req, res) => res.json({ msg: "posts works" }))

// @route GET api/posts
// @desc Gets posts
// @access Public
router.get('/', (req, res) => {
    Post.find().sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(error => res.status(404).json({ nopostsfound: 'No posts found.' }));
})

// @route GET api/posts/:id
// @desc Gets a single post
// @access Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(error => res.status(404).json({ nopostfound: 'No post found with that ID.' }));
})

// @route POST api/posts
// @desc Creates a post
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
})

// @route DELETE api/posts/:id
// @desc Deletes a post
// @access Private
router.delete('/:id', passport.authenticate('jwt', { session: false}), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'User not authroized.' })
                    }

                    post.remove().then(() => res.json({ success: true }));
                })
                .catch(error => res.status(404).json({ postnotfound: 'Post not found.' }))
        })
})

// @route POST api/posts/like/:id
// @desc Likes a post
// @access Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id) 
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({ alreadylike: 'User already like this post.' });
                    }

                    post.likes.unshift({ user: req.user.id });

                    post.save().then(post => res.json(post));
                })
                .catch(error => res.status(404).json({ postnotfound: 'Post not found.'}))
        })
})

// @route POST api/posts/unlike/:id
// @desc Unlikes a post
// @access Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => {
                if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                    return res.status(400).json({ alreadylike: 'User has not liked this post.' });
                }

                // find index of like
                const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);

                // remove like
                post.likes.splice(removeIndex, 1);

                post.save().then(post => res.json(post));
            })
            .catch(error => res.status(404).json({ postnotfound: 'Post not found.'}))
        })
})

// @route POST api/posts/comment/:id
// @desc Comments on a post
// @access Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
        return res.send(400).json(errors);
    }
    
    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }

            // add to comments array
            post.comments.unshift(newComment);

            post.save().then(post => res.json(post));
        })
        .catch(error => res.status(404).json({ postnotfound: 'Post not found'}))
})

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Deletes a comment from a post
// @access Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            // check to see if comment exists
            if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                res.status(404).json({ commentnotexists: 'Comment does not exist' });
            }

            // get index of comment
            const removeIndex = post.comments.map(comment => comment._id.toString()).indexOf(req.params.comment_id);

            // remove comment from comments array
            post.comments.splice(removeIndex, 1);

            post.save().then(post => res.json(post));
        })
        .catch(error => res.status(404).json({ postnotfound: 'Post not found' }))
})

module.exports = router;