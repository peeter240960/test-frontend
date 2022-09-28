import { Router } from 'express';
import PostsController from '@controllers/posts.controller';
import { CreatePostDto } from '@dtos/posts.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';

class PostRoute implements Routes {
  public path = '/posts';
  public router = Router();
  public postsController = new PostsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(`${this.path}`, authMiddleware);
    this.router.patch(`${this.path}/:id/like`, this.postsController.likePosts);

    this.router.get(`${this.path}/:id(\\d+)`, this.postsController.getPostById);
    this.router.put(`${this.path}/:id(\\d+)`, validationMiddleware(CreatePostDto, 'body', true), this.postsController.updatePost);
    this.router.delete(`${this.path}/:id(\\d+)`, this.postsController.deletePost);

    this.router.get(`${this.path}`, this.postsController.getPosts);
    this.router.post(`${this.path}`, validationMiddleware(CreatePostDto, 'body'), this.postsController.createPost);
  }
}

export default PostRoute;
