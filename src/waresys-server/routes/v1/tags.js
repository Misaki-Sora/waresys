const errs = require('restify-errors');
const { Router } = require('restify-router');
const querymen = require('querymen');

const router = new Router();

const auth = require('./auth');
const Tag = require('../../models/tag');
// var TagHistory = Tag.historyModel();
// var ObjectId = require('mongoose').Types.ObjectId;

router.use(auth.authenticate);


/**
 * @swagger
 * /tags:
 *   get:
 *     tags:
 *       - tags
 *     description: Returns all tags
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: skip
 *         description: Skips the number of records
 *         in: query
 *         required: false
 *         type: integer
 *       - name: limit
 *         description: Returns the number of records
 *         in: query
 *         required: false
 *         type: integer
 *       - name: sort
 *         description: Sorts records by key
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: An array of tag
 *         schema:
 *           $ref: '#/definitions/Tag'
 *       400:
 *         description: Bad request error
 *     security:
 *       - BasicAuth: []
 */

const tagSchemaQuerymen = new querymen.Schema({
  skip: {
    type: Number,
    default: 0,
    min: 0,
    bindTo: 'cursor',
  },
}, { page: false });


router.get('/tags', querymen.middleware(tagSchemaQuerymen), (req, res, next) => {
  const query = req.querymen;

  Tag.find(query.query, query.select, query.cursor, (err, tags) => {
    if (err) { return next(new errs.BadRequestError(err.message)); }

    return res.json(tags);
  });
});


/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     tags:
 *       - tags
 *     description: Returns a single tag
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Tag's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single tag
 *         schema:
 *           $ref: '#/definitions/Tag'
 *       400:
 *         description: Bad request error
 *       404:
 *         description: Not found error
 *     security:
 *       - BasicAuth: []
 */
router.get('/tags/:tag_id', (req, res, next) => {
  Tag.findById(req.params.tag_id, (err, tag) => {
    if (err) { return next(new errs.BadRequestError(err.message)); }

    if (!tag) { return next(new errs.NotFoundError('Tag not found')); }

    return res.json(tag);
  });
});


/**
 * /tags/{id}/history:
 *   get:
 *     tags:
 *       - tags
 *     description: Returns a tag history
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Tag's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: skip
 *         description: Skips the number of records
 *         in: query
 *         required: false
 *         type: integer
 *       - name: limit
 *         description: Returns the number of records
 *         in: query
 *         required: false
 *         type: integer
 *     responses:
 *       200:
 *         description: A tag history
 *         schema:
 *           $ref: '#/definitions/TagHistory'
 *       400:
 *         description: Bad request error
 *     security:
 *       - BasicAuth: []
 */
// var tagHistorySchemaQuerymen = new querymen.Schema({
//     skip: {
//         type: Number,
//         default: 0,
//         min: 0,
//         bindTo: 'cursor'
//     },
//     sort: '-t'
// }, {page: false});
//
// router.get('/tags/:tag_id/history', querymen.middleware(tagHistorySchemaQuerymen),
// function (req, res, next) {
//     var query = req.querymen;
//
//     TagHistory.find({'d._id': new ObjectId(req.params.tag_id)}, query.select, query.cursor,
//     function (err, history) {
//         if (err)
//             return next(new errs.BadRequestError(err.message));
//
//         res.json(history);
//     });
//
// });


/**
 * @swagger
 * /tags/uid/{uid}:
 *   get:
 *     tags:
 *       - tags
 *     description: Returns a single tag
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: uid
 *         description: Tag's uid
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single tag
 *         schema:
 *           $ref: '#/definitions/Tag'
 *       201:
 *         description: Successfully created
 *         schema:
 *           $ref: '#/definitions/Tag'
 *       400:
 *         description: Bad request error
 *     security:
 *       - BasicAuth: []
 */
router.get('/tags/uid/:tag_uid', (req, res, next) => {
  Tag.findOne({ uid: req.params.tag_uid }, (err, tag) => {
    if (err) { return next(new errs.BadRequestError(err.message)); }

    if (!tag) {
      const newTag = new Tag();
      newTag.uid = req.params.tag_uid;

      return newTag.save((err, tag) => {
        if (err) { return next(new errs.BadRequestError(err.message)); }

        req.log.info('create tag', tag);
        return res.json(201, tag);
      });
    }
    return res.json(tag);
  });
});


/**
 * @swagger
 * /tags/{id}:
 *   put:
 *     tags:
 *       - tags
 *     description: Updates a single tag
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Tag's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: type
 *         description: Tag's type
 *         in: formData
 *         required: true
 *         type: string
 *         enum:
 *           - unknown
 *           - item
 *           - mode
 *       - name: item
 *         description: Item's id
 *         in: formData
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully updated
 *         schema:
 *           $ref: '#/definitions/Tag'
 *       400:
 *         description: Bad request error
 *       404:
 *         description: Not found error
 *     security:
 *       - BasicAuth: []
 */
router.put('/tags/:tag_id', (req, res, next) => {
  Tag.findById(req.params.tag_id, (err, tag) => {
    if (err) { return next(new errs.BadRequestError(err.message)); }

    if (!tag) { return next(new errs.NotFoundError('Tag not found')); }

    tag.type = req.body.type;

    if (typeof req.body.item === 'string') {
      tag.item = req.body.item;
    } else {
      tag.item = req.body.item.id ? req.body.item.id : req.body.item._id;
    }

    return tag.save((err, tag) => {
      if (err) { return next(new errs.BadRequestError(err.message)); }

      req.log.info('update tag', tag);
      return tag.populate('item', (err, tag) => {
        if (err) { return next(new errs.BadRequestError(err.message)); }

        return res.json(tag);
      });
    });
  });
});


/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     tags:
 *       - tags
 *     description: Deletes a single tag
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Tag's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       204:
 *         description: Successfully deleted
 *       400:
 *         description: Bad request error
 *       404:
 *         description: Not found error
 *     security:
 *       - BasicAuth: []
 */
router.del('/tags/:tag_id', (req, res, next) => {
  Tag.findById(req.params.tag_id, (err, tag) => {
    if (err) { return next(new errs.BadRequestError(err.message)); }

    if (!tag) { return next(new errs.NotFoundError('Tag not found')); }

    return tag.remove((err, tag) => {
      if (err) { return next(new errs.InternalError('Error removing tag')); }

      req.log.info('delete tag', tag);
      return res.send(204);
    });
  });
});


module.exports = router;
