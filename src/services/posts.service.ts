import { PrismaClient, Post } from '@prisma/client';
import { CreatePostDto } from '@dtos/posts.dto';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';

class PostService {
  public posts = new PrismaClient().post;

  public async findAllPost(ownerId?: number, take?: number, skip?: number): Promise<Post[]> {
    const allPost: Post[] = await this.posts.findMany({ where: { ownerId }, take, skip, include: { Owner: true } });
    return allPost;
  }

  public async findPostById(postId: number): Promise<Post> {
    if (isEmpty(postId)) throw new HttpException(400, 'PostId is empty');

    const findPost: Post = await this.posts.findUnique({ where: { id: postId }, include: { Owner: true } });
    if (!findPost) throw new HttpException(409, "Post doesn't exist");

    return findPost;
  }

  public async createPost(postData: CreatePostDto): Promise<Post> {
    if (isEmpty(postData)) throw new HttpException(400, 'postData is empty');

    const createPostData: Post = await this.posts.create({ data: { ...postData } });
    return createPostData;
  }

  public async updatePost(postId: number, postData: CreatePostDto): Promise<Post> {
    if (isEmpty(postData)) throw new HttpException(400, 'postData is empty');

    const findPost: Post = await this.posts.findUnique({ where: { id: postId } });
    if (!findPost) throw new HttpException(409, "Post doesn't exist");

    const updatePostData = await this.posts.update({
      where: { id: postId },
      data: {
        readBy: postData.readBy,
        likedBy: postData.likedBy,
        ownerId: postData.ownerId,
        message: postData.message,
      },
    });
    return updatePostData;
  }

  public async deletePost(postId: number): Promise<Post> {
    if (isEmpty(postId)) throw new HttpException(400, "Post doesn't existId");

    const findPost: Post = await this.posts.findUnique({ where: { id: postId } });
    if (!findPost) throw new HttpException(409, "Post doesn't exist");

    const deletePostData = await this.posts.delete({ where: { id: postId } });
    return deletePostData;
  }
}

export default PostService;
