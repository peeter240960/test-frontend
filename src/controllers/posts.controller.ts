import { NextFunction, Request, Response } from 'express';
import { Post } from '@prisma/client';
import { CreatePostDto } from '@dtos/posts.dto';
import postService from '@services/posts.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

class PostsController {
  public postService = new postService();

  public getPosts = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = undefined;
      const take = +req.query.take || 10;
      const skip = +req.query.skip || 0;
      const findAllPostsData: Post[] = await this.postService.findAllPost(userId, take, skip);

      res.status(200).json({ data: findAllPostsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public likePosts = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postId = Number(req.params.id);
      const userId = Number(req.user.id);
      const findOnePostData: Post = await this.postService.findPostById(postId);
      let userLiked = findOnePostData.likedBy;
      if (findOnePostData.likedBy.includes(userId)) {
        userLiked = findOnePostData.likedBy.filter(uid => uid != userId);
      } else {
        userLiked.push(userId);
      }
      const updatePostData: Post = await this.postService.updatePost(postId, {
        ...findOnePostData,
        likedBy: userLiked,
      });

      res.status(200).json({ data: updatePostData, message: 'liked' });
    } catch (error) {
      next(error);
    }
  };

  public getPostById = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.user.id);
      const postId = Number(req.params.id);
      const findOnePostData: Post = await this.postService.findPostById(postId);
      if (!findOnePostData.readBy.includes(userId)) findOnePostData.readBy.push(userId);
      await this.postService.updatePost(postId, findOnePostData);
      res.status(200).json({ data: findOnePostData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createPost = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postData: CreatePostDto = req.body;
      postData.ownerId = req.user.id;
      const createPostData: Post = await this.postService.createPost(postData);

      res.status(201).json({ data: createPostData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postId = Number(req.params.id);
      const postData: CreatePostDto = req.body;
      const updatePostData: Post = await this.postService.updatePost(postId, postData);

      res.status(200).json({ data: updatePostData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postId = Number(req.params.id);
      const deletePostData: Post = await this.postService.deletePost(postId);

      res.status(200).json({ data: deletePostData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}

export default PostsController;
